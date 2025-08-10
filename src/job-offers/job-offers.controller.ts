import { Controller, Get } from '@nestjs/common';
import { JobOffersService } from './job-offers.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JobOffer } from '../entities/job-offer.entity';

@ApiTags('job-offers')
@Controller('api/job-offers')
export class JobOffersController {
  constructor(private readonly jobOffersService: JobOffersService) {}

  @Get()
  @ApiOperation({ summary: 'get all job offers' })
  @ApiResponse({
    status: 200,
    description: 'all job offers.',
    type: [JobOffer],
  })
  findAll() {
    return this.jobOffersService.findAll();
  }
}
