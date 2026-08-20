import { render, screen, waitFor } from '@testing-library/react';
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
});