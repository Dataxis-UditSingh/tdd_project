import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ChallengeCard from './ChallengeCard';

describe('ChallengeCard', () => {
  const challenge = {
    id: 'react-counter',
    title: 'Build a Counter',
    description: 'Build a counter using TDD.',
    difficulty: 'Beginner',
    concepts: ['React State', 'Events'],
  };

  it('renders the challenge title', () => {
    render(<ChallengeCard challenge={challenge} />);

    expect(
      screen.getByRole('heading', {
        name: 'Build a Counter',
      }),
    ).toBeInTheDocument();
  });

  it('renders the challenge description', () => {
    render(<ChallengeCard challenge={challenge} />);

    expect(
      screen.getByText('Build a counter using TDD.'),
    ).toBeInTheDocument();
  });

  it('renders the challenge difficulty', () => {
    render(<ChallengeCard challenge={challenge} />);

    expect(
      screen.getByText('Beginner'),
    ).toBeInTheDocument();
  });

  it('renders the start challenge button', () => {
    render(<ChallengeCard challenge={challenge} />);

    expect(
      screen.getByRole('button', {
        name: /start challenge/i,
      }),
    ).toBeInTheDocument();
  });
});