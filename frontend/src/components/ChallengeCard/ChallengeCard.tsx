type Challenge = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  concepts: string[];
};

type ChallengeCardProps = {
  challenge: Challenge;
};

export default function ChallengeCard({
  challenge,
}: ChallengeCardProps) {
  return (
    <article>
      <h2>{challenge.title}</h2>

      <p>{challenge.description}</p>

      <span>{challenge.difficulty}</span>

      <button type="button">
        Start Challenge
      </button>
    </article>
  );
}