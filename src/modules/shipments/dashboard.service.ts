import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, In } from 'typeorm';
import { Shipment, ShipmentStatus } from '@/modules/shipments/entities/shipment.entity';

export interface DashboardStats {
  totalShipments: number;
  shipmentsToday: number;
  shipmentsThisWeek: number;
  totalPackages: number;
  packagesToday: number;
  pendingShipments: number;
  completedShipments: number;
  fragileShipments: number;
  shipmentsByStatus: { status: string; count: number }[];
  shipmentsByMonth: { month: string; count: number }[];
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
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

    const allShipments = await this.shipmentRepo.find({ where: baseWhere });
    const todayShipments = allShipments.filter(s => new Date(s.createdAt) >= today);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekShipments = allShipments.filter(s => new Date(s.createdAt) >= weekAgo);

    const totalPackages = allShipments.reduce((sum, s) => sum + s.cantidadPaquetesTotal, 0);
    const packagesToday = todayShipments.reduce((sum, s) => sum + s.cantidadPaquetesTotal, 0);

    return {
      totalShipments:    allShipments.length,
      shipmentsToday:    todayShipments.length,
      shipmentsThisWeek: weekShipments.length,
      totalPackages,
      packagesToday,
      pendingShipments:   allShipments.filter(s => s.estado !== ShipmentStatus.COMPLETED).length,
      completedShipments: allShipments.filter(s => s.estado === ShipmentStatus.COMPLETED).length,
      fragileShipments:   allShipments.filter(s => s.fragil).length,
      shipmentsByStatus: [
        { status: 'borrador',   count: allShipments.filter(s => s.estado === ShipmentStatus.DRAFT).length },
        { status: 'en_proceso', count: allShipments.filter(s => s.estado === ShipmentStatus.IN_PROGRESS).length },
        { status: 'completado', count: allShipments.filter(s => s.estado === ShipmentStatus.COMPLETED).length },
      ],
      shipmentsByMonth: this.monthlyStats(allShipments),
    };
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
