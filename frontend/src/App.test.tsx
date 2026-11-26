import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import App from './App';


describe('TDD Challenge Lab', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the application heading', async () => {
    render(<App />);

    expect(
      screen.getByRole('heading', {
        name: /tdd challenge lab/i,
      }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/0 challenges/i)).toBeInTheDocument();
    });
  });

  it('shows the TDD rule', async () => {
    render(<App />);

    expect(
      screen.getByText(/tests before functional code/i),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/0 challenges/i)).toBeInTheDocument();
    });
  });

  it('renders challenges returned by the API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            id: 'react-counter',
            title: 'Build a Counter',
            description: 'Create a counter using tests first.',
            difficulty: 'Beginner',
            concepts: ['React state'],
            steps: ['Write test', 'Implement', 'Refactor'],
          },
        ],
      }),
    );

    render(<App />);

    expect(
      await screen.findByText('Build a Counter'),
    ).toBeInTheDocument();
  });

  it('submits a prompt and displays the selected agent response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            routing: {
              requestedAgent: 'testing',
              status: 'ready',
              message: 'Testing Agent is ready.',
              reason: 'Agent selected explicitly by the request.',
            },
            execution: {
              agentId: 'testing',
              status: 'success',
              output: 'describe("Button", () => { it("renders", () => {}); });',
            },
          }),
        }),
    );

    render(<App />);

    await screen.findByText(/0 challenges/i);

    fireEvent.change(screen.getByLabelText(/what do you want the agent to do/i), {
      target: { value: 'Write a test for a Button component' },
    });

    fireEvent.change(screen.getByLabelText(/^agent$/i), {
      target: { value: 'testing' },
    });

    fireEvent.click(screen.getByRole('button', { name: /generate response/i }));

    expect(await screen.findByRole('heading', { name: /testing agent/i }))
      .toBeInTheDocument();

    expect(
      screen.getByText(/describe\("button"/i),
    ).toBeInTheDocument();

    const fetchMock = vi.mocked(fetch);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining('/api/agent-router/execute'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          message: 'Write a test for a Button component',
          preferredAgent: 'testing',
        }),
      }),
    );
  });
});