import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Client } from './client.entity';
import { Carrier } from '../../../modules/carriers/entities/carrier.entity';

@Entity('client_addresses')
export class ClientAddress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id' })
  clientId: string;

  @ManyToOne(() => Client, (c) => c.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'carrier_id', type: 'varchar', nullable: true })
  carrierId: string | null;

  @ManyToOne(() => Carrier, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'carrier_id' })
  carrier: Carrier | null;

  @Column({ type: 'varchar', length: 100 })
  alias: string;

  @Column({ type: 'varchar', length: 300 })
  direccion: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ciudad: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  telefono: string | null;

  @Column({ default: false })
  predeterminado: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
