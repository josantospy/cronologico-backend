import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
  ) {}

  async create(companyId: string, clientId: string, createDto: CreateInvoiceDto): Promise<Invoice> {
    const existing = await this.invoiceRepo.findOne({
      where: { numeroFactura: createDto.numeroFactura },
    });

    if (existing) {
      throw new ConflictException('Invoice number already exists');
    }

    const invoice = this.invoiceRepo.create({
      ...createDto,
      companyId,
      clientId,
      fechaEmision: createDto.fechaEmision || new Date(),
    });
    return this.invoiceRepo.save(invoice);
  }

  async findAll(companyId: string): Promise<Invoice[]> {
    return this.invoiceRepo.find({
      where: { companyId },
      relations: ['client'],
      order: { fechaEmision: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findOne({
      where: { id },
      relations: ['client', 'company', 'shipmentDetails', 'shipmentDetails.shipment'],
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async update(id: string, updateDto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findOne(id);
    Object.assign(invoice, updateDto);
    return this.invoiceRepo.save(invoice);
  }

  async remove(id: string): Promise<void> {
    const invoice = await this.findOne(id);
    await this.invoiceRepo.remove(invoice);
  }
}
