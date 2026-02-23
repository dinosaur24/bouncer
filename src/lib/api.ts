export class APIError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = 'APIError';
  }
}

export async function simulateAPI<T>(
  data: T,
  options?: { delay?: number; failRate?: number; errorMessage?: string }
): Promise<T> {
  const delay = options?.delay ?? 500 + Math.random() * 300;
  const failRate = options?.failRate ?? 0.05;
  const errorMessage = options?.errorMessage ?? 'Something went wrong. Please try again.';

  await new Promise(resolve => setTimeout(resolve, delay));

  if (Math.random() < failRate) {
    throw new APIError(errorMessage);
  }

  return data;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
