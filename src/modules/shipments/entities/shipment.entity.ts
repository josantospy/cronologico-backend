import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from '../../../modules/companies/entities/company.entity';
import { User } from '../../../modules/users/entities/user.entity';
import { Client } from '../../../modules/clients/entities/client.entity';
import { Carrier } from '../../../modules/carriers/entities/carrier.entity';
import { ShipmentPacker } from './shipment-packer.entity';

export enum ShipmentStatus {
  DRAFT = 'borrador',
  IN_PROGRESS = 'en_proceso',
  COMPLETED = 'completado',
}

@Entity('shipment_records')
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company, (company) => company.shipments)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'creator_user_id' })
  creatorUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_user_id' })
  creatorUser: User;

  @Column({ name: 'client_id', nullable: true })
  clientId: string | null;

  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client: Client | null;

  @Column({ name: 'carrier_id', nullable: true })
  carrierId: string | null;

  @ManyToOne(() => Carrier, { nullable: true })
  @JoinColumn({ name: 'carrier_id' })
  carrier: Carrier | null;

  @Column({ name: 'sequence_number', type: 'varchar', length: 50, nullable: true })
  numeroSecuencia: string | null;

  @Column({ name: 'registration_date', type: 'timestamp', nullable: true })
  fechaRegistro: Date;

  @Column({ name: 'invoice_numbers', type: 'text', nullable: true })
  numerosFactura: string | null;

  @Column({ name: 'total_packages', default: 0 })
  cantidadPaquetesTotal: number;

  @Column({ type: 'enum', enum: ShipmentStatus, default: ShipmentStatus.DRAFT })
  estado: ShipmentStatus;

  @Column({ name: 'general_comments', type: 'text', nullable: true })
  comentariosGenerales: string;

  @Column({ default: false })
  fragil: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ShipmentPacker, (packer) => packer.shipment, { cascade: true })
  packers: ShipmentPacker[];
}
