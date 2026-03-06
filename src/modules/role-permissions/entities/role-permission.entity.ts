import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('role_permissions')
export class RolePermission {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  rol: string;

  @Column({ type: 'simple-json' })
  features: string[];

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
