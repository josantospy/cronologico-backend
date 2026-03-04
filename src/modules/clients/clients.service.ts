import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import { Client } from './entities/client.entity';
import { ClientAddress } from './entities/client-address.entity';
import { CreateClientDto, UpdateClientDto, CreateClientAddressDto, UpdateClientAddressDto } from './dto/client.dto';

const CLIENT_RELATIONS = ['companies', 'addresses', 'addresses.carrier'];

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
    @InjectRepository(ClientAddress)
    private readonly addressRepo: Repository<ClientAddress>,
  ) {}

  async create(createDto: CreateClientDto): Promise<Client> {
    const client = this.clientRepo.create({
      nombreCompleto: createDto.nombreCompleto,
      email: createDto.email,
      telefono: createDto.telefono,
      tipoDocumento: createDto.tipoDocumento,
      numeroDocumento: createDto.numeroDocumento,
      companies: (createDto.companyIds || []).map(id => ({ id }) as any),
    });
    const saved = await this.clientRepo.save(client);
    return this.findOne(saved.id);
  }

  async findAll(companyId?: string): Promise<Client[]> {
    if (companyId) {
      return this.clientRepo
        .createQueryBuilder('client')
        .leftJoinAndSelect('client.companies', 'company')
        .leftJoinAndSelect('client.addresses', 'address')
        .leftJoinAndSelect('address.carrier', 'carrier')
        .where('company.id = :companyId', { companyId })
        .orderBy('client.nombreCompleto', 'ASC')
        .getMany();
    }
    return this.clientRepo.find({
      relations: CLIENT_RELATIONS,
      order: { nombreCompleto: 'ASC' },
    });
  }

  async search(companyId: string | undefined, query: string): Promise<Client[]> {
    const qb = this.clientRepo
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.companies', 'company')
      .leftJoinAndSelect('client.addresses', 'address')
      .leftJoinAndSelect('address.carrier', 'carrier')
      .where(
        '(client.nombreCompleto ILIKE :q OR client.numeroDocumento ILIKE :q)',
        { q: `%${query}%` },
      );

    if (companyId) {
      qb.andWhere('company.id = :companyId', { companyId });
    }

    return qb.orderBy('client.nombreCompleto', 'ASC').take(10).getMany();
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepo.findOne({
      where: { id },
      relations: CLIENT_RELATIONS,
    });
    if (!client) throw new NotFoundException(`Client with ID ${id} not found`);
    return client;
  }

  async update(id: string, updateDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);

    const { companyIds, ...scalars } = updateDto;
    Object.assign(client, scalars);

    if (companyIds !== undefined) {
      client.companies = companyIds.map(cid => ({ id: cid }) as any);
    }

    await this.clientRepo.save(client);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);
    await this.clientRepo.remove(client);
  }

  // ── Addresses ─────────────────────────────────────────────────────────────

  async addAddress(clientId: string, dto: CreateClientAddressDto): Promise<ClientAddress> {
    await this.findOne(clientId); // validates existence

    if (dto.predeterminado) {
      await this.addressRepo.update({ clientId }, { predeterminado: false });
    }

    const address = this.addressRepo.create({
      clientId,
      alias:         dto.alias,
      direccion:     dto.direccion,
      ciudad:        dto.ciudad   || null,
      telefono:      dto.telefono || null,
      carrierId:     dto.carrierId || null,
      predeterminado: dto.predeterminado || false,
    });

    const saved = await this.addressRepo.save(address);
    return this.addressRepo.findOne({
      where: { id: saved.id },
      relations: ['carrier'],
    }) as Promise<ClientAddress>;
  }

  async updateAddress(clientId: string, addressId: string, dto: UpdateClientAddressDto): Promise<ClientAddress> {
    const address = await this.addressRepo.findOne({ where: { id: addressId, clientId } });
    if (!address) throw new NotFoundException(`Address ${addressId} not found`);

    if (dto.predeterminado) {
      await this.addressRepo.update({ clientId }, { predeterminado: false });
    }

    Object.assign(address, dto);
    const saved = await this.addressRepo.save(address);
    return this.addressRepo.findOne({
      where: { id: saved.id },
      relations: ['carrier'],
    }) as Promise<ClientAddress>;
  }

  async removeAddress(clientId: string, addressId: string): Promise<void> {
    const address = await this.addressRepo.findOne({ where: { id: addressId, clientId } });
    if (!address) throw new NotFoundException(`Address ${addressId} not found`);
    await this.addressRepo.remove(address);
  }
}
