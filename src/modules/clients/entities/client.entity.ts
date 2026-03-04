import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../../../modules/companies/entities/company.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company, (company) => company.clients)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'full_name', length: 200 })
  nombreCompleto: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 50, nullable: true })
  telefono: string;

  @Column({ length: 300, nullable: true })
  direccion: string;

  @Column({ name: 'document_type', length: 20, nullable: true })
  tipoDocumento: string;

  @Column({ name: 'document_number', length: 50, nullable: true })
  numeroDocumento: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
