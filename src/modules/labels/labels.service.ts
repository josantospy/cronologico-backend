import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PackageLabel } from './entities/label.entity';
import { Shipment } from '../../modules/shipments/entities/shipment.entity';
import { v4 as uuidv4 } from 'uuid';

export interface GenerateLabelDto {
  shipmentId: string;
  quantity: number;
}

export interface LabelData {
  id: string;
  codigoBarrasQR: string;
  contenidoEtiqueta: string;
  esFragil: boolean;
  shipment: {
    numeroSecuencia: string | null;
    cantidadPaquetesTotal: number;
  };
  fechaImpresion: Date;
}

@Injectable()
export class LabelsService {
  constructor(
    @InjectRepository(PackageLabel)
    private readonly labelRepo: Repository<PackageLabel>,
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
  ) {}

  private generateBarcode(): string {
    return `LAB-${uuidv4().substring(0, 8).toUpperCase()}-${Date.now()}`;
  }

  async generateLabels(shipmentId: string, userId: string, dto: GenerateLabelDto): Promise<LabelData[]> {
    const shipment = await this.shipmentRepo.findOne({ where: { id: dto.shipmentId } });
    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${dto.shipmentId} not found`);
    }

    const labels: LabelData[] = [];
    const printDate = new Date();

    for (let i = 0; i < dto.quantity; i++) {
      const codigoBarrasQR = this.generateBarcode();

      const label = this.labelRepo.create({
        shipmentId: dto.shipmentId,
        codigoBarrasQR,
        contenidoEtiqueta: `Envío: ${shipment.numeroSecuencia} | Paquete: ${i + 1}/${dto.quantity}`,
        esFragil: shipment.fragil,
        fechaImpresion: printDate,
        printedByUserId: userId,
      });

      const savedLabel = await this.labelRepo.save(label);

      labels.push({
        id: savedLabel.id,
        codigoBarrasQR: savedLabel.codigoBarrasQR,
        contenidoEtiqueta: savedLabel.contenidoEtiqueta,
        esFragil: savedLabel.esFragil,
        shipment: {
          numeroSecuencia: shipment.numeroSecuencia,
          cantidadPaquetesTotal: shipment.cantidadPaquetesTotal,
        },
        fechaImpresion: savedLabel.fechaImpresion,
      });
    }

    return labels;
  }

  async findByShipment(shipmentId: string): Promise<PackageLabel[]> {
    return this.labelRepo.find({
      where: { shipmentId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PackageLabel> {
    const label = await this.labelRepo.findOne({
      where: { id },
      relations: ['shipment', 'printedByUser'],
    });

    if (!label) {
      throw new NotFoundException(`Label with ID ${id} not found`);
    }

    return label;
  }

  async reprint(id: string, userId: string): Promise<PackageLabel> {
    const label = await this.findOne(id);
    label.fechaImpresion = new Date();
    label.printedByUserId = userId;
    return this.labelRepo.save(label);
  }
}
