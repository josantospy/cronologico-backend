import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, In } from 'typeorm';
import { Shipment } from '@/modules/shipments/entities/shipment.entity';
import { ShipmentStatus } from '@/modules/shipments/entities/shipment.entity';

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

  async getStats(companyIds?: string[]): Promise<DashboardStats> {
    const baseWhere = companyIds?.length ? { companyId: In(companyIds) } : {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [allShipments, todayShipments, weekShipments] = await Promise.all([
      this.shipmentRepo.find({ where: baseWhere }),
      this.shipmentRepo.find({
        where: { ...baseWhere, createdAt: MoreThanOrEqual(today) },
      }),
      this.shipmentRepo.find({
        where: { ...baseWhere, createdAt: MoreThanOrEqual(weekAgo) },
      }),
    ]);

    const totalPackages = allShipments.reduce(
      (sum, s) => sum + s.cantidadPaquetesTotal,
      0
    );

    const packagesToday = todayShipments.reduce(
      (sum, s) => sum + s.cantidadPaquetesTotal,
      0
    );

    const shipmentsByStatus = [
      { status: 'borrador', count: allShipments.filter(s => s.estado === ShipmentStatus.DRAFT).length },
      { status: 'en_proceso', count: allShipments.filter(s => s.estado === ShipmentStatus.IN_PROGRESS).length },
      { status: 'completado', count: allShipments.filter(s => s.estado === ShipmentStatus.COMPLETED).length },
    ];

    const shipmentsByMonth = this.getMonthlyStats(allShipments);

    return {
      totalShipments: allShipments.length,
      shipmentsToday: todayShipments.length,
      shipmentsThisWeek: weekShipments.length,
      totalPackages,
      packagesToday,
      pendingShipments: allShipments.filter(s => s.estado !== ShipmentStatus.COMPLETED).length,
      completedShipments: allShipments.filter(s => s.estado === ShipmentStatus.COMPLETED).length,
      fragileShipments: allShipments.filter(s => s.fragil).length,
      shipmentsByStatus,
      shipmentsByMonth,
    };
  }

  private getMonthlyStats(shipments: Shipment[]): { month: string; count: number }[] {
    const months: Record<string, number> = {};
    
    shipments.forEach(s => {
      const date = new Date(s.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[monthKey] = (months[monthKey] || 0) + 1;
    });

    return Object.entries(months)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);
  }
}
