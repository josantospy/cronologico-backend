import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, OneToMany } from 'typeorm';
import { User } from '../../../modules/users/entities/user.entity';
import { Client } from '../../../modules/clients/entities/client.entity';
import { Carrier } from '../../../modules/carriers/entities/carrier.entity';
import { Shipment } from '../../../modules/shipments/entities/shipment.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  nombre: string;

  @Column({ name: 'rut', length: 20, unique: true })
  rut: string;

  @Column({ length: 300, nullable: true })
  direccion: string;

  @Column({ length: 50, nullable: true })
  telefono: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ name: 'registration_date', type: 'timestamp', nullable: true })
  fechaRegistro: Date;

  @Column({ default: true })
  estado: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToMany(() => User, (user) => user.companies)
  users: User[];

  @ManyToMany(() => Client, (client) => client.companies)
  clients: Client[];

  @ManyToMany(() => Carrier, (carrier) => carrier.companies)
  carriers: Carrier[];

  @OneToMany(() => Shipment, (shipment) => shipment.company)
  shipments: Shipment[];
}
