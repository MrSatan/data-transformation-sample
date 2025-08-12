import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('job_offers')
// A job is considered unique based on its title, company name, and location.
@Index(['title', 'companyName', 'location'], { unique: true })
export class JobOffer {
  @ApiProperty({
    description: 'Internal unique identifier',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Unique identifier from the source API',
    example: 'P1-339',
  })
  @Column({ name: 'external_id' })
  externalId: string;

  @ApiProperty({
    description: 'The title of the job',
    example: 'Backend Engineer',
  })
  @Column()
  title: string;

  @ApiProperty({
    description: 'The location of the job',
    example: 'San Francisco, CA',
  })
  @Column()
  location: string;

  @ApiProperty({
    description: 'A detailed description of the job',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @ApiProperty({
    description: 'The name of the company hiring',
    example: 'TechCorp',
  })
  @Column({ name: 'company_name' })
  companyName: string;

  @ApiProperty({
    description: 'Minimum salary estimate',
    example: 85000,
    nullable: true,
  })
  @Column({ name: 'salary_min', type: 'integer', nullable: true })
  salaryMin?: number | null;

  @ApiProperty({
    description: 'Maximum salary estimate',
    example: 141000,
    nullable: true,
  })
  @Column({ name: 'salary_max', type: 'integer', nullable: true })
  salaryMax?: number | null;

  @ApiProperty({
    description: 'Currency of the salary',
    example: 'USD',
    nullable: true,
  })
  @Column({ nullable: true })
  currency?: string;

  @ApiProperty({
    description: 'Skills required for the job',
    type: [String],
    example: ['JavaScript', 'Node.js'],
  })
  @Column({ type: 'text', array: true, nullable: true })
  skills?: string[];

  @ApiProperty({ description: 'The date the job was originally posted' })
  @Column({ name: 'posted_at', type: 'timestamp with time zone' })
  postedAt: Date;

  @ApiProperty({
    description: 'The source API the job was fetched from',
    example: 'Provider1',
  })
  @Column({ name: 'source_api' })
  sourceApi: string;

  @ApiProperty({
    description: 'The date the record was created in our database',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'The date the record was last updated in our database',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
