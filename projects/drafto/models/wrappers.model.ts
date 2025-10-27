import { HttpErrorResponse } from '@angular/common/http';
import { DEFAULT_API_ERROR_MESSAGE } from '../constants/utils.constant';
import 'reflect-metadata';

export class ApiError extends Error {
  code: number = 0;
  description: string = DEFAULT_API_ERROR_MESSAGE;
  source: string = 'Unknown Api Error';
  details: {
    method: string;
    url: string;
    errors?: Array<{
      field: string;
      location: string[];
      message: string;
    }> | null;
  };

  constructor(response?: HttpErrorResponse) {
    super(DEFAULT_API_ERROR_MESSAGE);
    this.details = { method: '', url: '', errors: null };

    if (response && response.error) {
      const errorBody = response.error;
      this.code = errorBody.code || 0;
      this.description = errorBody.description || this.description;
      this.source = errorBody.source || this.source;
      this.details = {
        method: errorBody.details?.method || '',
        url: errorBody.details?.url || '',
        errors:
          errorBody.details?.errors?.map((err: any) => ({
            field: err.field || '',
            location: err.location || [],
            message: err.message || '',
          })) || null,
      };

      this.message = this.description;
    }
  }

  /**
   * Get first error message if available
   */
  getFirstErrorMessage(): string {
    return this.details.errors?.[0]?.message || this.description;
  }
}
