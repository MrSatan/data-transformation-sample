import { JobOffer } from '../../entities/job-offer.entity';

export interface IJobOfferMapper<T> {
  readonly providerName: string;
  transform(
    data: T,
    ...args: any[]
  ): Omit<JobOffer, 'id' | 'createdAt' | 'updatedAt'>;
}
