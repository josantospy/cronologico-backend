import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Shipment } from '@/modules/shipments/entities/shipment.entity';
import { User } from '@/modules/users/entities/user.entity';

@Entity('package_labels')
export class PackageLabel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'shipment_id' })
  shipmentId: string;

  @ManyToOne(() => Shipment)
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;

  @Column({ name: 'barcode_qr', length: 100, unique: true })
  codigoBarrasQR: string;

  @Column({ name: 'label_content', type: 'text' })
  contenidoEtiqueta: string;

  @Column({ name: 'is_fragile', default: false })
  esFragil: boolean;

  @Column({ name: 'print_date', type: 'timestamp', nullable: true })
  fechaImpresion: Date;

  @Column({ name: 'printed_by_user_id' })
  printedByUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'printed_by_user_id' })
  printedByUser: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
