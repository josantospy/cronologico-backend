import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('companies')
@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async create(createDto: CreateCompanyDto): Promise<Company> {
    const company = this.companyRepo.create({
      ...createDto,
      fechaRegistro: new Date(),
    });
    return this.companyRepo.save(company);
  }

  async findAll(): Promise<Company[]> {
    return this.companyRepo.find({
      where: { estado: true },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companyRepo.findOne({
      where: { id },
      relations: ['users', 'clients', 'carriers'],
    });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }

  async update(id: string, updateDto: UpdateCompanyDto): Promise<Company> {
    const company = await this.findOne(id);
    Object.assign(company, updateDto);
    return this.companyRepo.save(company);
  }

  async remove(id: string): Promise<void> {
    const company = await this.findOne(id);
    company.estado = false;
    await this.companyRepo.save(company);
  }

  async findByRut(rut: string): Promise<Company | null> {
    return this.companyRepo.findOne({ where: { rut } });
  }
}
