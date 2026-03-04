import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SequenceConfig } from './entities/sequence-config.entity';
import { SequencesController } from './sequences.controller';
import { SequencesService } from './sequences.service';

@Module({
  imports: [TypeOrmModule.forFeature([SequenceConfig])],
  controllers: [SequencesController],
  providers: [SequencesService],
  exports: [SequencesService],
})
export class SequencesModule {}
