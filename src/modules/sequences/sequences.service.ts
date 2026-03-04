import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SequenceConfig, ResetPeriod } from './entities/sequence-config.entity';

@Injectable()
export class SequencesService {
  constructor(
    @InjectRepository(SequenceConfig)
    private readonly sequenceRepo: Repository<SequenceConfig>,
  ) {}

  async getOrCreateConfig(companyId: string): Promise<SequenceConfig> {
    let config = await this.sequenceRepo.findOne({
      where: { companyId },
    });

    if (!config) {
      config = this.sequenceRepo.create({
        companyId,
        prefijo: 'SEQ',
        longitudSecuencia: 6,
        periodoReinicio: ResetPeriod.YEARLY,
        separador: '-',
        secuenciaActual: 0,
      });
      config = await this.sequenceRepo.save(config);
    }

    return config;
  }

  async generateSequence(companyId: string): Promise<string> {
    const config = await this.getOrCreateConfig(companyId);

    const now = new Date();
    let shouldReset = false;

    if (config.periodoReinicio === ResetPeriod.YEARLY) {
      const lastYear = config.updatedAt?.getFullYear() || 0;
      shouldReset = now.getFullYear() > lastYear;
    } else if (config.periodoReinicio === ResetPeriod.MONTHLY) {
      const lastMonth = config.updatedAt?.getMonth() || 0;
      const lastYear = config.updatedAt?.getFullYear() || 0;
      shouldReset = now.getMonth() > lastMonth || now.getFullYear() > lastYear;
    }

    if (shouldReset) {
      config.secuenciaActual = 0;
    }

    config.secuenciaActual += 1;
    await this.sequenceRepo.save(config);

    const year = now.getFullYear().toString().slice(-2);
    const sequenceNum = config.secuenciaActual.toString().padStart(config.longitudSecuencia, '0');
    
    return `${config.prefijo}${config.separador}${year}${config.separador}${sequenceNum}`;
  }

  async findAllForCompanies(companyIds: string[]): Promise<SequenceConfig[]> {
    for (const companyId of companyIds) {
      await this.getOrCreateConfig(companyId);
    }
    return this.sequenceRepo.find({
      where: { companyId: In(companyIds) },
      relations: ['company'],
      order: { companyId: 'ASC' },
    });
  }

  async updateConfig(companyId: string, updateData: Partial<SequenceConfig>): Promise<SequenceConfig> {
    const config = await this.getOrCreateConfig(companyId);
    Object.assign(config, updateData);
    await this.sequenceRepo.save(config);
    return this.sequenceRepo.findOne({ where: { companyId }, relations: ['company'] }) as Promise<SequenceConfig>;
  }

  async resetSequence(companyId: string): Promise<SequenceConfig> {
    const config = await this.getOrCreateConfig(companyId);
    config.secuenciaActual = 0;
    await this.sequenceRepo.save(config);
    return this.sequenceRepo.findOne({ where: { companyId }, relations: ['company'] }) as Promise<SequenceConfig>;
  }
}
