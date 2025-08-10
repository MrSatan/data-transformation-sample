import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('job_offers')
// A job is considered unique based on its title, company name, and location.
@Index(['title', 'companyName', 'location'], { unique: true })
export class JobOffer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'external_id', unique: true })
  externalId: string;

  @Column()
  title: string;

  @Column()
  location: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'company_name' })
  companyName: string;

  @Column({ name: 'salary_min', type: 'integer', nullable: true })
  salaryMin?: number;

  @Column({ name: 'salary_max', type: 'integer', nullable: true })
  salaryMax?: number;

  @Column({ nullable: true })
  currency?: string;

  @Column({ type: 'text', array: true, nullable: true })
  skills?: string[];

  @Column({ name: 'posted_at', type: 'timestamp with time zone' })
  postedAt: Date;

  @Column({ name: 'source_api' })
  sourceApi: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
