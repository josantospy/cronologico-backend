import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Shipment, ShipmentStatus } from './entities/shipment.entity';
import { ShipmentPacker } from './entities/shipment-packer.entity';
import { SequencesService } from '../../modules/sequences/sequences.service';
import { CreateShipmentDto, UpdateShipmentDto, AddShipmentPackerDto } from './dto/shipment.dto';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    @InjectRepository(ShipmentPacker)
    private readonly packerRepo: Repository<ShipmentPacker>,
    private readonly sequencesService: SequencesService,
  ) {}

  async create(companyId: string, creatorUserId: string, createDto: CreateShipmentDto): Promise<Shipment> {
    const totalPaquetes = createDto.packers.reduce(
      (sum, p) => sum + p.cantidadPaquetes,
      0,
    );

    const shipment = this.shipmentRepo.create({
      companyId,
      creatorUserId,
      clientId: createDto.clientId || null,
      carrierId: createDto.carrierId || null,
      numeroSecuencia: null,
      fechaRegistro: new Date(),
      numerosFactura: createDto.numerosFactura || null,
      cantidadPaquetesTotal: totalPaquetes,
      fragil: createDto.fragil || false,
      comentariosGenerales: createDto.comentariosGenerales,
      estado: ShipmentStatus.DRAFT,
    });

    const savedShipment = await this.shipmentRepo.save(shipment) as Shipment;

    for (const packerDto of createDto.packers) {
      const packer = this.packerRepo.create({
        shipmentId: savedShipment.id,
        empacadorId: packerDto.empacadorId,
        cantidadPaquetes: packerDto.cantidadPaquetes,
      });
      await this.packerRepo.save(packer);
    }

    return this.findOne(savedShipment.id);
  }

  async findAll(companyIds?: string[]): Promise<Shipment[]> {
    return this.shipmentRepo.find({
      where: companyIds?.length ? { companyId: In(companyIds) } : {},
      relations: ['company', 'client', 'carrier', 'creatorUser', 'packers', 'packers.empacador'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Shipment> {
    const shipment = await this.shipmentRepo.findOne({
      where: { id },
      relations: ['company', 'client', 'carrier', 'creatorUser', 'packers', 'packers.empacador'],
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }

    return shipment;
  }

  async update(id: string, updateDto: UpdateShipmentDto): Promise<Shipment> {
    await this.findOne(id); // validates existence

    const { packers, ...fields } = updateDto;

    // Build only the explicitly provided scalar fields to avoid overwriting with undefined
    const scalarUpdate: Record<string, unknown> = {};
    if (fields.clientId !== undefined)            scalarUpdate['clientId'] = fields.clientId || null;
    if ('carrierId' in fields)                    scalarUpdate['carrierId'] = fields.carrierId ?? null;
    if (fields.numerosFactura !== undefined)       scalarUpdate['numerosFactura'] = fields.numerosFactura || null;
    if (fields.fragil !== undefined)               scalarUpdate['fragil'] = fields.fragil;
    if (fields.comentariosGenerales !== undefined) scalarUpdate['comentariosGenerales'] = fields.comentariosGenerales || null;
    if (fields.estado !== undefined)               scalarUpdate['estado'] = fields.estado;

    if (packers !== undefined) {
      await this.packerRepo.delete({ shipmentId: id });
      for (const p of packers) {
        await this.packerRepo.save(
          this.packerRepo.create({ shipmentId: id, empacadorId: p.empacadorId, cantidadPaquetes: p.cantidadPaquetes }),
        );
      }
      scalarUpdate['cantidadPaquetesTotal'] = packers.reduce((sum, p) => sum + p.cantidadPaquetes, 0);
    }

    if (Object.keys(scalarUpdate).length > 0) {
      await this.shipmentRepo.update(id, scalarUpdate);
    }

    return this.findOne(id);
  }

  async addPacker(shipmentId: string, dto: AddShipmentPackerDto): Promise<Shipment> {
    const shipment = await this.findOne(shipmentId);

    const packer = this.packerRepo.create({
      shipmentId,
      empacadorId: dto.empacadorId,
      cantidadPaquetes: dto.cantidadPaquetes,
    });

    await this.packerRepo.save(packer);

    shipment.cantidadPaquetesTotal += dto.cantidadPaquetes;
    await this.shipmentRepo.save(shipment);

    return this.findOne(shipmentId);
  }

  async removePacker(shipmentId: string, packerId: string): Promise<Shipment> {
    const shipment = await this.findOne(shipmentId);
    const packer = await this.packerRepo.findOne({ where: { id: packerId } });

    if (!packer || packer.shipmentId !== shipmentId) {
      throw new NotFoundException(`Packer with ID ${packerId} not found in this shipment`);
    }

    shipment.cantidadPaquetesTotal = Math.max(0, shipment.cantidadPaquetesTotal - packer.cantidadPaquetes);
    await this.shipmentRepo.save(shipment);
    await this.packerRepo.remove(packer);

    return this.findOne(shipmentId);
  }

  async complete(id: string): Promise<Shipment> {
    const shipment = await this.findOne(id);
    if (!shipment.numeroSecuencia) {
      shipment.numeroSecuencia = await this.sequencesService.generateSequence(shipment.companyId);
    }
    shipment.estado = ShipmentStatus.COMPLETED;
    return this.shipmentRepo.save(shipment);
  }

  async remove(id: string): Promise<void> {
    const shipment = await this.findOne(id);
    await this.packerRepo.delete({ shipmentId: id });
    await this.shipmentRepo.remove(shipment);
  }
}
