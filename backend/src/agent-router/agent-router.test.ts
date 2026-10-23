import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../app.js';

describe('AI Agent Router foundation', () => {
  it('reports placeholder agents and configuration', async () => {
    const response = await request(app).get('/api/agent-router/status');

    expect(response.status).toBe(200);
    expect(response.body.mode).toBe('placeholder');
    expect(response.body.agents.map((agent: { id: string }) => agent.id)).toEqual([
      'coding',
      'testing',
      'devops',
      'documentation',
      'general',
    ]);
  });

  it('routes a coding request without executing an agent', async () => {
    const response = await request(app)
      .post('/api/agent-router/route')
      .send({ message: 'Help me debug a React component' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      requestedAgent: 'coding',
      status: 'ready',
      message: 'Coding Agent is implemented and ready to execute.',
    });
  });

  it('routes an implemented testing agent when explicitly selected', async () => {
    const response = await request(app)
      .post('/api/agent-router/route')
      .send({
        message: 'Generate unit tests for this function',
        preferredAgent: 'testing',
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      requestedAgent: 'testing',
      status: 'ready',
      message: 'Testing Agent is implemented and ready to execute.',
    });
  });

  it('routes an implemented documentation agent when explicitly selected', async () => {
    const response = await request(app)
      .post('/api/agent-router/route')
      .send({
        message: 'Write API documentation',
        preferredAgent: 'documentation',
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      requestedAgent: 'documentation',
      status: 'ready',
      message: 'Documentation Agent is implemented and ready to execute.',
    });
  });

  it('routes an implemented DevOps agent when explicitly selected', async () => {
    const response = await request(app)
      .post('/api/agent-router/route')
      .send({
        message: 'Help deploy an application using Kubernetes',
        preferredAgent: 'devops',
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      requestedAgent: 'devops',
      status: 'ready',
      message: 'DevOps Agent is implemented and ready to execute.',
    });
  });

  it('rejects an empty message', async () => {
    const response = await request(app)
      .post('/api/agent-router/route')
      .send({ message: '  ' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('INVALID_REQUEST');
  });

  it('rejects unsupported agent IDs', async () => {
    const response = await request(app)
      .post('/api/agent-router/route')
      .send({ message: 'Do this', preferredAgent: 'admin' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('UNKNOWN_AGENT');
  });

  it('rejects excessively long messages', async () => {
    const response = await request(app)
      .post('/api/agent-router/route')
      .send({ message: 'x'.repeat(10_001) });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('MESSAGE_TOO_LONG');
  });
});
