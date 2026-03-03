import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Shipment } from './shipment.entity';
import { User } from '@/modules/users/entities/user.entity';

@Entity('shipment_packers')
export class ShipmentPacker {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'shipment_id' })
  shipmentId: string;

  @ManyToOne(() => Shipment, (shipment) => shipment.packers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;

  @Column({ name: 'empacador_id' })
  empacadorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'empacador_id' })
  empacador: User;

  @Column({ name: 'cantidad_paquetes', default: 1 })
  cantidadPaquetes: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
