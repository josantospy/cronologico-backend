import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Carrier } from './entities/carrier.entity';
import { Company } from '../../modules/companies/entities/company.entity';
import { CreateCarrierDto, UpdateCarrierDto } from './dto/carrier.dto';

@Injectable()
export class CarriersService {
  constructor(
    @InjectRepository(Carrier)
    private readonly carrierRepo: Repository<Carrier>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async create(dto: CreateCarrierDto): Promise<Carrier> {
    const { companyIds, ...fields } = dto;
    const companies = companyIds?.length
      ? await this.companyRepo.findBy({ id: In(companyIds) })
      : [];
    const carrier = this.carrierRepo.create({ ...fields, estado: true, companies });
    return this.carrierRepo.save(carrier);
  }

  async findAll(companyId?: string): Promise<Carrier[]> {
    const qb = this.carrierRepo
      .createQueryBuilder('carrier')
      .leftJoinAndSelect('carrier.companies', 'company')
      .orderBy('carrier.nombre', 'ASC');

    if (companyId) {
      qb.innerJoin('carrier.companies', 'filterCompany', 'filterCompany.id = :companyId', { companyId });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Carrier> {
    const carrier = await this.carrierRepo.findOne({ where: { id }, relations: ['companies'] });
    if (!carrier) throw new NotFoundException(`Carrier with ID ${id} not found`);
    return carrier;
  }

  async update(id: string, dto: UpdateCarrierDto): Promise<Carrier> {
    const carrier = await this.findOne(id);
    const { companyIds, ...fields } = dto;

    if (Object.keys(fields).length) {
      await this.carrierRepo.update(id, fields);
    }

    if (companyIds !== undefined) {
      carrier.companies = companyIds.length
        ? await this.companyRepo.findBy({ id: In(companyIds) })
        : [];
      await this.carrierRepo.save(carrier);
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<Carrier> {
    await this.findOne(id);
    await this.carrierRepo.update(id, { estado: false });
    return this.findOne(id);
  }
}
