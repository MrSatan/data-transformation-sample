import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { Provider1JobDto } from '../../../src/providers/dto/provider.dto';
import { Provider1Mapper } from '../../../src/job-offers/mapper/Provider1.mapper';

describe('Provider1Mapper', () => {
  let mapper: Provider1Mapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Provider1Mapper, Logger],
    }).compile();

    mapper = module.get<Provider1Mapper>(Provider1Mapper);
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  it('should correctly transform valid provider 1 data', () => {
    const rawData: Provider1JobDto = {
      jobId: 'P1-123',
      title: 'Senior Software Engineer',
      details: {
        location: 'Remote',
        type: 'Full-Time',
        salaryRange: '$120k - $150k',
      },
      company: { name: 'Tech Innovations', industry: 'Software' },
      skills: ['TypeScript', 'NestJS', 'PostgreSQL'],
      postedDate: '2025-08-10T10:00:00.000Z',
    };

    const result = mapper.transform(rawData);

    expect(result).toBeDefined();
    expect(result.externalId).toEqual('P1-123');
    expect(result.title).toEqual('Senior Software Engineer');
    expect(result.companyName).toEqual('Tech Innovations');
    expect(result.location).toEqual('Remote');
    expect(result.salaryMin).toEqual(120000);
    expect(result.salaryMax).toEqual(150000);
    expect(result.skills).toEqual(['TypeScript', 'NestJS', 'PostgreSQL']);
    expect(result.postedAt).toEqual(new Date('2025-08-10T10:00:00.000Z'));
    expect(result.sourceApi).toEqual('Provider1');
  });
});
