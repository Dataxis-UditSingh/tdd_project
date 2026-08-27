import { useEffect, useState } from 'react';
import { getChallenges } from './api';
import type { Challenge } from './types';

export default function App() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getChallenges()
      .then(setChallenges)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="app">
      <section className="hero">
        <span className="eyebrow">TDD IS NON-NEGOTIABLE</span>
        <h1>TDD Challenge Lab</h1>
        
        <p>
          Tests before functional code. Red → Green → Refactor.
        </p>
      </section>

      <section className="rule">
        <strong>Pairing rule:</strong> engineers write the test first.
        <span> No implementation before a failing test.</span>
      </section>

      <section className="content">
        <div className="section-heading">
          <div>
            <span className="eyebrow">LIVE CHALLENGES</span>
            <h2>Practice the workflow</h2>
          </div>
          <span className="badge">{challenges.length} challenges</span>
        </div>

        {loading && <p role="status">Loading challenges…</p>}
        {error && <p role="alert">{error}</p>}

        <div className="grid">
          {challenges.map((challenge) => (
            <article className="card" key={challenge.id}>
              <div className="card-top">
                <span className="difficulty">{challenge.difficulty}</span>
              </div>
              <h3>{challenge.title}</h3>
              <p>{challenge.description}</p>
              <div className="concepts">
                {challenge.concepts.map((concept) => (
                  <span key={concept}>{concept}</span>
                ))}
              </div>
              <ol>
                {challenge.steps.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
