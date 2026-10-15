import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { parseCsv, toCsv } from '../common/csv.util';
import { computeStats, Summary } from '../common/stats.util';
import { ExperimentsService } from '../experiments/experiments.service';
import { CreateRunDto } from './dto/create-run.dto';
import { Run } from './run.entity';

@Injectable()
export class RunsService {
  constructor(
    @InjectRepository(Run) private readonly repo: Repository<Run>,
    private readonly experiments: ExperimentsService,
  ) {}

  async create(experimentId: number, dto: CreateRunDto): Promise<Run> {
    await this.experiments.findOne(experimentId); // 404 if missing
    this.assertNumeric(dto.measurements);

    return this.repo.save(
      this.repo.create({
        experimentId,
        measurements: dto.measurements,
        settings: dto.settings ?? null,
        notes: dto.notes ?? null,
      }),
    );
  }

  async findAll(experimentId: number): Promise<Run[]> {
    await this.experiments.findOne(experimentId);
    return this.repo.find({ where: { experimentId }, order: { id: 'ASC' } });
  }

  async remove(experimentId: number, runId: number): Promise<void> {
    const run = await this.repo.findOneBy({ id: runId, experimentId });
    if (!run) {
      throw new NotFoundException(
        `Run ${runId} not found in experiment ${experimentId}`,
      );
    }
    await this.repo.remove(run);
  }

  async importCsv(
    experimentId: number,
    csvText: string,
  ): Promise<{ imported: number }> {
    await this.experiments.findOne(experimentId);

    let rows;
    try {
      rows = parseCsv(csvText);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }

    await this.repo.save(
      rows.map((row) =>
        this.repo.create({
          experimentId,
          measurements: row.measurements,
          notes: row.notes,
          settings: null,
        }),
      ),
    );
    return { imported: rows.length };
  }

  async exportCsv(experimentId: number): Promise<string> {
    return toCsv(await this.findAll(experimentId));
  }

  async stats(experimentId: number): Promise<{
    experimentId: number;
    runCount: number;
    measurements: Record<string, Summary>;
  }> {
    const runs = await this.findAll(experimentId);
    return {
      experimentId,
      runCount: runs.length,
      measurements: computeStats(runs),
    };
  }

  private assertNumeric(measurements: Record<string, unknown>): void {
    const entries = Object.entries(measurements);
    if (entries.length === 0) {
      throw new BadRequestException('measurements must not be empty');
    }
    for (const [name, value] of entries) {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new BadRequestException(
          `measurement "${name}" must be a finite number`,
        );
      }
    }
  }
}
