import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JobOffer } from '../src/entities/job-offer.entity';
import { ObjectLiteral, Repository } from 'typeorm';
import { JobOfferPaginationResponseDto } from '../src/job-offers/dto/job-offer-pagination.response';

interface IValidationError {
  statusCode: number;
  message: string[];
  error: string;
}
describe('JobOffersController (e2e)', () => {
  let app: INestApplication;
  type MockRepository<T extends ObjectLiteral = any> = Partial<
    Record<keyof Repository<T>, jest.Mock>
  >;

  const mockJobOfferRepository: MockRepository<JobOffer> = {
    createQueryBuilder: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(JobOffer))
      .useValue(mockJobOfferRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/job-offers (GET) - should return a paginated response', async () => {
    // Arrange
    const mockJobs: Partial<JobOffer>[] = [{ id: '1', title: 'Test Job' }];
    const mockQueryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([mockJobs, 1]),
    };

    if (mockJobOfferRepository.createQueryBuilder) {
      mockJobOfferRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
    }

    const response = await request(app.getHttpServer())
      .get('/api/job-offers?page=1&limit=10&title=Test')
      .expect(200);

    const body = response.body as JobOfferPaginationResponseDto;
    // Assert
    expect(body.items).toHaveLength(1);
    expect(body.items[0].title).toEqual('Test Job');
    expect(body.totalItems).toEqual(1);
  });

  it('/api/job-offers (GET) - should return 400 for invalid query params', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/job-offers?page=-1')
      .expect(400);
    const body = response.body as IValidationError;
    expect(body.message).toContain('page must not be less than 1');
  });
});
