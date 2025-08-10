import { JobOffer } from '../../entities/job-offer.entity';

export interface IJobOfferMapper<T> {
  transform(
    data: T,
    ...args: any[]
  ): Omit<JobOffer, 'id' | 'createdAt' | 'updatedAt'>;
}
