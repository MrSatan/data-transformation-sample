import { ApiProperty } from '@nestjs/swagger';

export class PaginationResponseDto<T> {
  @ApiProperty({
    isArray: true,
    description: 'Array of results for the current page',
  })
  readonly items: T[];

  @ApiProperty({
    type: Number,
    description: 'Total number of items',
  })
  readonly totalItems: number;

  @ApiProperty({ type: Number, description: 'The current page number' })
  readonly currentPage: number;

  @ApiProperty({ type: Number, description: 'Total number of pages available' })
  readonly totalPages: number;
}
