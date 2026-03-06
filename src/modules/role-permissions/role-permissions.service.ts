import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermission } from './entities/role-permission.entity';

const DEFAULTS: Record<string, string[]> = {
  supervisor: ['dashboard', 'shipments', 'clients', 'carriers', 'print'],
  empacador:  ['dashboard', 'shipments'],
};

@Injectable()
export class RolePermissionsService {
  constructor(
    @InjectRepository(RolePermission)
    private readonly repo: Repository<RolePermission>,
  ) {}

  async findAll(): Promise<Record<string, string[]>> {
    let rows = await this.repo.find();
    if (!rows.length) {
      await this.seedDefaults();
      rows = await this.repo.find();
    }
    return Object.fromEntries(rows.map(r => [r.rol, r.features]));
  }

  async updateRole(rol: string, features: string[]): Promise<Record<string, string[]>> {
    await this.repo.upsert({ rol, features }, ['rol']);
    return this.findAll();
  }

  private async seedDefaults(): Promise<void> {
    for (const [rol, features] of Object.entries(DEFAULTS)) {
      await this.repo.upsert({ rol, features }, ['rol']);
    }
  }
}
