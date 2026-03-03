import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { Company } from '@/modules/companies/entities/company.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepo.findOne({ where: { email: createDto.email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const companies = createDto.companyIds?.length
      ? await this.companyRepo.findBy({ id: In(createDto.companyIds) })
      : [];

    const hashedPassword = await bcrypt.hash(createDto.contraseña, 10);
    const user = this.userRepo.create({
      nombre: createDto.nombre,
      email: createDto.email,
      contraseña: hashedPassword,
      rol: createDto.rol || UserRole.EMPACADOR,
      fechaRegistro: new Date(),
      companies,
    });

    return this.userRepo.save(user);
  }

  async validateUser(email: string, contraseña: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { email },
      relations: ['companies'],
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    if (!user.estado) throw new UnauthorizedException('User account is inactive');

    return user;
  }

  async login(user: User): Promise<{ accessToken: string; user: Partial<User> & { companyIds: string[] } }> {
    const companyIds = (user.companies || []).map(c => c.id);
    const payload = { sub: user.id, email: user.email, rol: user.rol, companyIds };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
        companies: user.companies,
        companyIds,
      },
    };
  }

  async findEmpacadores(companyId?: string): Promise<User[]> {
    const qb = this.userRepo.createQueryBuilder('user')
      .where('user.rol = :rol', { rol: UserRole.EMPACADOR })
      .andWhere('user.estado = true')
      .orderBy('user.nombre', 'ASC');

    if (companyId) {
      qb.innerJoin('user.companies', 'company', 'company.id = :companyId', { companyId });
    }

    return qb.getMany();
  }

  async findAll(rol?: UserRole): Promise<User[]> {
    return this.userRepo.find({
      where: rol ? { rol } : undefined,
      relations: ['companies'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['companies'],
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email }, relations: ['companies'] });
  }

  async update(id: string, updateDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    const scalarFields: Record<string, unknown> = {};
    if (updateDto.nombre !== undefined) scalarFields['nombre'] = updateDto.nombre;
    if (updateDto.rol !== undefined) scalarFields['rol'] = updateDto.rol;
    if (updateDto.estado !== undefined) scalarFields['estado'] = updateDto.estado;
    if (updateDto.contraseña) scalarFields['contraseña'] = await bcrypt.hash(updateDto.contraseña, 10);

    if (Object.keys(scalarFields).length > 0) {
      await this.userRepo.update(id, scalarFields);
    }

    if (updateDto.companyIds !== undefined) {
      user.companies = updateDto.companyIds.length
        ? await this.companyRepo.findBy({ id: In(updateDto.companyIds) })
        : [];
      await this.userRepo.save(user);
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.estado = false;
    return this.userRepo.save(user);
  }
}
