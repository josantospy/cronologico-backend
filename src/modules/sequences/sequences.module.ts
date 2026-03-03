import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SequenceConfig } from './entities/sequence-config.entity';
import { SequencesService } from './sequences.service';

@Module({
  imports: [TypeOrmModule.forFeature([SequenceConfig])],
  providers: [SequencesService],
  exports: [SequencesService],
})
export class SequencesModule {}
