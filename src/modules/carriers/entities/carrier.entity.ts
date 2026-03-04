import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Company } from '../../../modules/companies/entities/company.entity';

@Entity('carriers')
export class Carrier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  nombre: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 50, nullable: true })
  telefono: string;

  @Column({ name: 'vehicle_type', length: 50, nullable: true })
  tipoVehiculo: string;

  @Column({ length: 20, nullable: true })
  patente: string;

  @Column({ default: true })
  estado: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToMany(() => Company, (company) => company.carriers, { eager: false })
  @JoinTable({
    name: 'carrier_companies',
    joinColumn: { name: 'carrier_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'company_id', referencedColumnName: 'id' },
  })
  companies: Company[];
}
