// src/providers/providers.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  Provider1ApiResponse,
  Provider1JobDto,
  Provider2ApiResponse,
  Provider2JobDto,
} from './dto/provider.dto';
import { formatAxiosError } from '../util/error';

@Injectable()
export class ProvidersService {
  private readonly logger = new Logger(ProvidersService.name);

  constructor(private readonly httpService: HttpService) {}

  async fetchJobsFromProvider1(): Promise<Provider1JobDto[]> {
    try {
      const url = 'https://assignment.devotel.io/api/provider1/jobs';

      const response = await firstValueFrom(
        this.httpService.get<Provider1ApiResponse>(url),
      );
      this.logger.log(
        `Successfully fetched ${response.data.jobs.length} raw jobs from Provider 1.`,
        ProvidersService.name,
      );
      return response.data.jobs;
    } catch (error) {
      const formattedError = formatAxiosError(error);
      this.logger.error(formattedError, ProvidersService.name);
      return [];
    }
  }

  async fetchJobsFromProvider2(): Promise<Record<string, Provider2JobDto>> {
    try {
      const url = 'https://assignment.devotel.io/api/provider2/jobs';
      const response = await firstValueFrom(
        this.httpService.get<Provider2ApiResponse>(url),
      );
      const jobsList = response.data.data.jobsList;
      this.logger.log(
        `Successfully fetched ${Object.keys(jobsList).length} raw jobs from Provider 2.`,
        ProvidersService.name,
      );
      return jobsList;
    } catch (error) {
      const formattedError = formatAxiosError(error);
      this.logger.error(formattedError, ProvidersService.name);
      return {};
    }
  }
}
