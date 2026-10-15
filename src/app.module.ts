import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Experiment } from './experiments/experiment.entity';
import { ExperimentsModule } from './experiments/experiments.module';
import { Run } from './runs/run.entity';
import { RunsModule } from './runs/runs.module';

@Module({
  imports: [
    // forRootAsync so the DB path is read when the app starts (lets tests use ':memory:')
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'better-sqlite3' as const,
        database: process.env.DB_PATH ?? 'research.db',
        entities: [Experiment, Run],
        synchronize: true, // fine for a portfolio project; use migrations in production
      }),
    }),
    ExperimentsModule,
    RunsModule,
  ],
})
export class AppModule {}
