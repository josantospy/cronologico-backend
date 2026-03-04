import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../../../modules/companies/entities/company.entity';

export enum ResetPeriod {
  NONE = 'ninguno',
  YEARLY = 'anual',
  MONTHLY = 'mensual',
}

@Entity('sequence_config')
export class SequenceConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', unique: true })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ length: 20, default: 'SEQ' })
  prefijo: string;

  @Column({ name: 'sequence_length', default: 6 })
  longitudSecuencia: number;

  @Column({ type: 'enum', enum: ResetPeriod, default: ResetPeriod.YEARLY })
  periodoReinicio: ResetPeriod;

  @Column({ name: 'separator', length: 5, default: '-' })
  separador: string;

  @Column({ name: 'current_sequence', default: 0 })
  secuenciaActual: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
