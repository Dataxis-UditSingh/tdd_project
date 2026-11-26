import { describe, it, expect } from 'vitest';

describe('Undici instrumentation', () => {
  it('should execute an outgoing fetch request', async () => {
    const response = await fetch(
      'https://jsonplaceholder.typicode.com/posts/1',
    );

    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data).toHaveProperty('id', 1);
  });
});