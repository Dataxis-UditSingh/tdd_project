import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from './app.js';

describe('API', () => {
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
});
