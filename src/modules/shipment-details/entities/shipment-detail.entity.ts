import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Shipment } from '@/modules/shipments/entities/shipment.entity';
import { Invoice } from '@/modules/invoices/entities/invoice.entity';
import { User } from '@/modules/users/entities/user.entity';

@Entity('shipment_details')
export class ShipmentDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'shipment_id' })
  shipmentId: string;

  @ManyToOne(() => Shipment)
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;

  @Column({ name: 'invoice_id' })
  invoiceId: string;

  @ManyToOne(() => Invoice)
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ name: 'package_quantity', default: 0 })
  cantidadPaquetes: number;

  @Column({ default: false })
  fragil: boolean;

  @Column({ name: 'detail_comment', type: 'text', nullable: true })
  comentarioDetalle: string;

  @Column({ name: 'added_by_user_id' })
  addedByUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'added_by_user_id' })
  addedByUser: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
