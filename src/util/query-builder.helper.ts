import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { Filter } from './filter';
import { SortOrder } from '../job-offers/dto/query-job-offer.dto';

export class QueryBuilderHelper<T extends ObjectLiteral> {
  private readonly filterRegistry = new Map<string, Filter<T>>();

  constructor(
    private readonly repository: Repository<T>,
    private readonly entityAlias: string,
  ) {}

  addFilter(dtoKey: string, filter: Filter<T>): this {
    this.filterRegistry.set(dtoKey, filter);
    return this;
  }

  build(dto: Record<string, unknown>): SelectQueryBuilder<T> {
    const queryBuilder = this.repository.createQueryBuilder(this.entityAlias);

    // Apply registered filters
    for (const [key, filter] of this.filterRegistry.entries()) {
      const value = dto[key];
      if (value !== undefined && value !== null && value !== '') {
        filter.apply(queryBuilder, this.entityAlias, value);
      }
    }

    // Handle Sorting
    if (
      typeof dto.sortBy === 'string' &&
      Object.values(SortOrder).includes(dto.sortOrder as SortOrder)
    ) {
      const sortByField = `${this.entityAlias}.${dto.sortBy}`;
      queryBuilder.orderBy(sortByField, dto.sortOrder as SortOrder);
    } else {
      // Default sort
      queryBuilder.orderBy(`${this.entityAlias}.postedAt`, 'DESC');
    }

    // Handle Pagination
    if (typeof dto.page === 'number' && typeof dto.limit === 'number') {
      const offset = (dto.page - 1) * dto.limit;
      queryBuilder.skip(offset).take(dto.limit);
    }

    return queryBuilder;
  }
}
