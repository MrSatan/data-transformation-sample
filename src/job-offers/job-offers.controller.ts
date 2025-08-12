import { Controller, Get, Query } from '@nestjs/common';
import { JobOffersService } from './job-offers.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JobOffer } from '../entities/job-offer.entity';
import { PaginationResponseDto } from '../shared/dto/pagination-response.dto';
import { QueryJobOfferDto } from './dto/query-job-offer.dto';
import { JobOfferPaginationResponseDto } from './dto/job-offer-pagination.response';

@ApiTags('job-offers')
@Controller('api/job-offers')
export class JobOffersController {
  constructor(private readonly jobOffersService: JobOffersService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve, filter, sort, and paginate job offers',
    description:
      'Returns a paginated list of job offers with support for various filters and sorting options.',
  })
  @ApiResponse({
    status: 200,
    description: 'A paginated list of job offers.',
    type: JobOfferPaginationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Invalid query parameters.',
  })
  findAll(
    @Query() queryDto: QueryJobOfferDto,
  ): Promise<PaginationResponseDto<JobOffer>> {
    return this.jobOffersService.findAll(queryDto);
  }
}
