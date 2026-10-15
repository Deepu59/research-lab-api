import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExperimentsModule } from '../experiments/experiments.module';
import { RunsController } from './runs.controller';
import { Run } from './run.entity';
import { RunsService } from './runs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Run]), ExperimentsModule],
  controllers: [RunsController],
  providers: [RunsService],
})
export class RunsModule {}
