import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export enum FilterOperator {
  ILIKE, // LIKE for strings
  EQUALS, // Direct equality '='
  GTE, // Greater than or equal to '>='
  LTE, // Less than or equal to '<='
  CONTAINS, // PostgreSQL arrays, '@>'
}

export class Filter<T extends ObjectLiteral> {
  constructor(
    private readonly column: keyof T,
    private readonly operator: FilterOperator,
    private readonly transformValue?: (value: unknown) => unknown,
  ) {}

  apply(
    queryBuilder: SelectQueryBuilder<T>,
    entityAlias: string,
    dtoValue: unknown,
  ): SelectQueryBuilder<T> {
    const value = this.transformValue
      ? this.transformValue(dtoValue)
      : dtoValue;
    const paramName = `${String(this.column)}Param`;
    const columnPath = `${entityAlias}.${String(this.column)}`;

    switch (this.operator) {
      case FilterOperator.ILIKE:
        return queryBuilder.andWhere(`${columnPath} ILIKE :${paramName}`, {
          [paramName]: `%${String(value)}%`,
        });
      case FilterOperator.GTE:
        return queryBuilder.andWhere(`${columnPath} >= :${paramName}`, {
          [paramName]: value,
        });
      case FilterOperator.CONTAINS:
        return queryBuilder.andWhere(`${columnPath} @> :${paramName}`, {
          [paramName]: value,
        });
      case FilterOperator.EQUALS:
        return queryBuilder.andWhere(`${columnPath} = :${paramName}`, {
          [paramName]: value,
        });
      default:
        // throw error for unsupported operators
        return queryBuilder;
    }
  }
}
