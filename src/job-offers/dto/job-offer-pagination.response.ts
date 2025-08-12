import { ApiProperty } from '@nestjs/swagger';
import { PaginationResponseDto } from '../../shared/dto/pagination-response.dto';
import { JobOffer } from '../../entities/job-offer.entity';

export class JobOfferPaginationResponseDto extends PaginationResponseDto<JobOffer> {
  @ApiProperty({
    type: [JobOffer],
  })
  readonly items: JobOffer[] = [];
}
