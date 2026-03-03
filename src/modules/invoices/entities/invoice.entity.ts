import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum InvoiceStatus {
  PENDIENTE = 'pendiente',
  PAGADA = 'pagada',
  ANULADA = 'anulada',
}

// Esta entidad ya no se usa en el sistema. Se conserva solo para referencia histórica.
@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id', nullable: true })
  clientId: string;

  @Column({ name: 'company_id', nullable: true })
  companyId: string;

  @Column({ name: 'invoice_number', length: 50, unique: true })
  numeroFactura: string;

  @Column({ name: 'issue_date', type: 'timestamp', nullable: true })
  fechaEmision: Date;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  montoTotal: number;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.PENDIENTE })
  estado: InvoiceStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
