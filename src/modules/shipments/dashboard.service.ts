import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, In } from 'typeorm';
import { Shipment, ShipmentStatus } from '../../modules/shipments/entities/shipment.entity';
import { ShipmentPacker } from '../../modules/shipments/entities/shipment-packer.entity';

export interface PackerStat {
  empacadorId: string;
  nombre: string;
  cantidadPaquetes: number;
  totalEnvios: number;
}

export interface CarrierStat {
  carrierId: string;
  nombre: string;
  patente: string | null;
  totalEnvios: number;
  totalPaquetes: number;
}

export interface DashboardStats {
  totalShipments: number;
  shipmentsToday: number;
  shipmentsThisWeek: number;
  totalPackages: number;
  packagesToday: number;
  pendingShipments: number;
  dispatchedShipments: number;
  completedShipments: number;
  fragileShipments: number;
  shipmentsByStatus: { status: string; count: number }[];
  shipmentsByMonth: { month: string; count: number }[];
  packerStats: PackerStat[];
  carrierStats: CarrierStat[];
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    @InjectRepository(ShipmentPacker)
    private readonly packerRepo: Repository<ShipmentPacker>,
  ) {}

  async getStats(companyIds?: string[], dateFrom?: Date, dateTo?: Date): Promise<DashboardStats> {
    const companyWhere = companyIds?.length ? { companyId: In(companyIds) } : {};

    let dateWhere: any = {};
    if (dateFrom && dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      dateWhere = { createdAt: Between(dateFrom, end) };
    } else if (dateFrom) {
      dateWhere = { createdAt: MoreThanOrEqual(dateFrom) };
    } else if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      dateWhere = { createdAt: LessThanOrEqual(end) };
    }

    const baseWhere = { ...companyWhere, ...dateWhere };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allShipments = await this.shipmentRepo.find({ where: baseWhere, relations: ['carrier'] });
    const todayShipments = allShipments.filter(s => new Date(s.createdAt) >= today);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekShipments = allShipments.filter(s => new Date(s.createdAt) >= weekAgo);

    const totalPackages = allShipments.reduce((sum, s) => sum + s.cantidadPaquetesTotal, 0);
    const packagesToday = todayShipments.reduce((sum, s) => sum + s.cantidadPaquetesTotal, 0);

    const packerStats = await this.getPackerStats(allShipments.map(s => s.id));

    return {
      totalShipments:    allShipments.length,
      shipmentsToday:    todayShipments.length,
      shipmentsThisWeek: weekShipments.length,
      totalPackages,
      packagesToday,
      pendingShipments:    allShipments.filter(s => s.estado === ShipmentStatus.IN_PROGRESS).length,
      dispatchedShipments: allShipments.filter(s => s.estado === ShipmentStatus.DISPATCHED).length,
      completedShipments:  allShipments.filter(s => s.estado === ShipmentStatus.COMPLETED).length,
      fragileShipments:    allShipments.filter(s => s.fragil).length,
      shipmentsByStatus: [
        { status: 'en_proceso', count: allShipments.filter(s => s.estado === ShipmentStatus.IN_PROGRESS).length },
        { status: 'despachado', count: allShipments.filter(s => s.estado === ShipmentStatus.DISPATCHED).length },
        { status: 'completado', count: allShipments.filter(s => s.estado === ShipmentStatus.COMPLETED).length },
      ],
      shipmentsByMonth: this.monthlyStats(allShipments),
      packerStats,
      carrierStats: this.buildCarrierStats(allShipments),
    };
  }

  private async getPackerStats(shipmentIds: string[]): Promise<PackerStat[]> {
    if (!shipmentIds.length) return [];

    const rows = await this.packerRepo.find({
      where: { shipmentId: In(shipmentIds) },
      relations: ['empacador'],
    });

    const map = new Map<string, PackerStat>();
    for (const row of rows) {
      const entry = map.get(row.empacadorId);
      if (entry) {
        entry.cantidadPaquetes += row.cantidadPaquetes;
        entry.totalEnvios++;
      } else {
        map.set(row.empacadorId, {
          empacadorId:     row.empacadorId,
          nombre:          row.empacador?.nombre ?? 'Sin nombre',
          cantidadPaquetes: row.cantidadPaquetes,
          totalEnvios:     1,
        });
      }
    }

    return Array.from(map.values())
      .sort((a, b) => b.cantidadPaquetes - a.cantidadPaquetes);
  }

  private buildCarrierStats(shipments: Shipment[]): CarrierStat[] {
    const map = new Map<string, CarrierStat>();
    for (const s of shipments) {
      if (!s.carrierId || !s.carrier) continue;
      const entry = map.get(s.carrierId);
      if (entry) {
        entry.totalEnvios++;
        entry.totalPaquetes += s.cantidadPaquetesTotal;
      } else {
        map.set(s.carrierId, {
          carrierId:     s.carrierId,
          nombre:        s.carrier.nombre,
          patente:       s.carrier.patente ?? null,
          totalEnvios:   1,
          totalPaquetes: s.cantidadPaquetesTotal,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.totalPaquetes - a.totalPaquetes);
  }

  private monthlyStats(shipments: Shipment[]): { month: string; count: number }[] {
    const months: Record<string, number> = {};
    shipments.forEach(s => {
      const d = new Date(s.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);
  }
}
