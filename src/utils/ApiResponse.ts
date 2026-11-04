/**
 * @description Standard API response envelope.
 * Wraps data with a consistent { success, statusCode, data, message } shape
 * while keeping top-level property compatibility for web and TV player clients.
 */
export class ApiResponse {
  statusCode: number;
  data: unknown;
  message: string;
  success: boolean;
  [key: string]: unknown;

  constructor(statusCode: number, data: unknown, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;

    if (data && typeof data === 'object' && !Array.isArray(data)) {
      Object.assign(this, data);
    }
  }
}
