type Challenge = {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    concepts: string[];
};

type ChallengeCardProps = {
    challenge: Challenge;
    onStart: (challenge: Challenge) => void;
};

export default function ChallengeCard({
    challenge,
    onStart,
}: ChallengeCardProps) {
    return (
        <article>
            <h2>{challenge.title}</h2>

            <p>{challenge.description}</p>

            <span>{challenge.difficulty}</span>

            <button
                type="button"
                onClick={() => onStart(challenge)}
            >
                Start Challenge
            </button>
        </article>
    );
}