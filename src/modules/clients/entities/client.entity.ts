import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Company } from '../../../modules/companies/entities/company.entity';
import { ClientAddress } from './client-address.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(() => Company, { eager: false })
  @JoinTable({
    name: 'client_companies',
    joinColumn:        { name: 'client_id',   referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'company_id',  referencedColumnName: 'id' },
  })
  companies: Company[];

  @Column({ name: 'full_name', length: 200 })
  nombreCompleto: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 50, nullable: true })
  telefono: string;

  @Column({ name: 'document_type', length: 20, nullable: true })
  tipoDocumento: string;

  @Column({ name: 'document_number', length: 50, nullable: true })
  numeroDocumento: string;

  @OneToMany(() => ClientAddress, (a) => a.client, { cascade: true })
  addresses: ClientAddress[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
