import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExperimentDto } from './dto/create-experiment.dto';
import { UpdateExperimentDto } from './dto/update-experiment.dto';
import { Experiment } from './experiment.entity';

@Injectable()
export class ExperimentsService {
  constructor(
    @InjectRepository(Experiment) private readonly repo: Repository<Experiment>,
  ) {}

  create(dto: CreateExperimentDto): Promise<Experiment> {
    return this.repo.save(this.repo.create(dto));
  }

  findAll(): Promise<Experiment[]> {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Experiment> {
    const experiment = await this.repo.findOneBy({ id });
    if (!experiment) {
      throw new NotFoundException(`Experiment ${id} not found`);
    }
    return experiment;
  }

  async update(id: number, dto: UpdateExperimentDto): Promise<Experiment> {
    const experiment = await this.findOne(id);
    Object.assign(experiment, dto);
    return this.repo.save(experiment);
  }

  async remove(id: number): Promise<void> {
    const experiment = await this.findOne(id);
    await this.repo.remove(experiment); // runs are deleted too (ON DELETE CASCADE)
  }
}
