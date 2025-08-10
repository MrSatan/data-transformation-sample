import { isAxiosError } from 'axios';

interface PostgresError {
  code: string;
}

export function isPostgresError(error: unknown): error is PostgresError {
  return typeof error === 'object' && error !== null && 'code' in error;
}

export function formatAxiosError(error: unknown): string {
  if (isAxiosError(error)) {
    const errorSummary = {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
    };
    return JSON.stringify(errorSummary, null, 2);
  }

  // Fallback for non-Axios errors
  if (error instanceof Error) {
    return <string>error.stack;
  }

  return String(error);
}
