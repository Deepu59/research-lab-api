import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { Run } from '../runs/run.entity';

@Entity()
export class Experiment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  hypothesis: string | null;

  /** Free-form experiment settings, e.g. { "motor": "BO", "supplyVoltage": 7.4 } */
  @Column({ type: 'simple-json', nullable: true })
  parameters: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Run, (run) => run.experiment)
  runs: Relation<Run[]>;
}
