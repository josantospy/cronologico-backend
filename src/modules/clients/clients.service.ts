import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
  ) {}

  async create(companyId: string, createDto: CreateClientDto): Promise<Client> {
    const client = this.clientRepo.create({
      ...createDto,
      companyId,
    });
    return this.clientRepo.save(client);
  }

  async findAll(companyId?: string): Promise<Client[]> {
    return this.clientRepo.find({
      where: companyId ? { companyId } : undefined,
      relations: ['company'],
      order: { nombreCompleto: 'ASC' },
    });
  }

  async search(companyId: string | undefined, query: string): Promise<Client[]> {
    const base = companyId ? { companyId } : {};
    return this.clientRepo.find({
      where: [
        { ...base, nombreCompleto: ILike(`%${query}%`) },
        { ...base, numeroDocumento: ILike(`%${query}%`) },
      ],
      order: { nombreCompleto: 'ASC' },
      take: 10,
    });
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepo.findOne({
      where: { id },
    });
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return client;
  }

  async update(id: string, updateDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);
    Object.assign(client, updateDto);
    return this.clientRepo.save(client);
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);
    await this.clientRepo.remove(client);
  }
}
