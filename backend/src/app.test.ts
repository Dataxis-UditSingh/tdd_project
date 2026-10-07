import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from './app.js';
import { swaggerSpec } from './swagger.js';

describe('API', () => {
  it('serves the Swagger UI and documents the API routes', async () => {
    const response = await request(app).get('/api-docs').redirects(1);

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/text\/html/);
    expect(swaggerSpec).toMatchObject({
      paths: {
        '/api/health': expect.any(Object),
        '/api/challenges': expect.any(Object),
        '/api/challenges/{id}': expect.any(Object),
      },
    });
  });

  it('returns a healthy status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('returns the static challenge collection', async () => {
    const response = await request(app).get('/api/challenges');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0]).toMatchObject({
      id: 'react-counter',
      title: 'Build a Counter',
    });
  });

  it('returns one challenge by id', async () => {
    const response = await request(app).get('/api/challenges/api-health');

    expect(response.status).toBe(200);
    expect(response.body.id).toBe('api-health');
  });

  it('returns 404 for an unknown challenge', async () => {
    const response = await request(app).get('/api/challenges/unknown');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Challenge not found' });
  });

  it('filters challenges by difficulty', async () => {
    const response = await request(app)
      .get('/api/challenges?difficulty=Beginner');

    expect(response.status).toBe(200);

    expect(response.body).toHaveLength(1);

    expect(response.body[0]).toMatchObject({
      id: 'react-counter',
      difficulty: 'Beginner',
    });
  });

  it('returns an empty array for an unknown difficulty', async () => {
    const response = await request(app)
      .get('/api/challenges?difficulty=Unknown');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});
