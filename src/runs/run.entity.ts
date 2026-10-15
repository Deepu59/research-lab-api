import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { Experiment } from '../experiments/experiment.entity';

/** One trial of an experiment, with its measured values. */
@Entity()
export class Run {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  experimentId: number;

  @ManyToOne(() => Experiment, (experiment) => experiment.runs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'experimentId' })
  experiment: Relation<Experiment>;

  /** Measured values, e.g. { "speed": 1.2, "voltage": 7.4 } */
  @Column({ type: 'simple-json' })
  measurements: Record<string, number>;

  /** Optional settings used for this particular run. */
  @Column({ type: 'simple-json', nullable: true })
  settings: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
