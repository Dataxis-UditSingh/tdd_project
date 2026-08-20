import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

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

    it('calls onStart with the selected challenge when Start Challenge is clicked', async () => {
        const user = userEvent.setup();

        const onStart = vi.fn();

        render(
            <ChallengeCard
                challenge={challenge}
                onStart={onStart}
            />,
        );

        await user.click(
            screen.getByRole('button', {
                name: /start challenge/i,
            }),
        );

        expect(onStart).toHaveBeenCalledWith(challenge);
    });
});