
import { useEffect, useState } from 'react';
import { executeAgent, getChallenges } from './api';
import type { AgentExecutionResponse, AgentId } from './api';
import type { Challenge } from './types';

const agentOptions: { value: 'auto' | AgentId; label: string }[] = [
  { value: 'auto', label: 'Auto-select agent' },
  { value: 'coding', label: 'Coding Agent' },
  { value: 'testing', label: 'Testing Agent' },
  { value: 'documentation', label: 'Documentation Agent' },
  { value: 'devops', label: 'DevOps Agent' },
  { value: 'general', label: 'General Agent' },
];

export default function App() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [prompt, setPrompt] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<'auto' | AgentId>('auto');
  const [executing, setExecuting] = useState(false);
  const [agentError, setAgentError] = useState('');
  const [result, setResult] = useState<AgentExecutionResponse | null>(null);

  useEffect(() => {
    getChallenges()
      .then(setChallenges)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleAgentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!prompt.trim() || executing) return;

    setExecuting(true);
    setAgentError('');
    setResult(null);

    try {
      const response = await executeAgent(
        prompt.trim(),
        selectedAgent === 'auto' ? undefined : selectedAgent,
      );
      setResult(response);
    } catch (err) {
      setAgentError(
        err instanceof Error ? err.message : 'Unable to execute the request.',
      );
    } finally {
      setExecuting(false);
    }
  }

  return (
    <main className="app">
      <section className="hero">
        <span className="eyebrow">TDD IS NON-NEGOTIABLE</span>
        <h1>TDD Challenge Lab</h1>
        <p>Tests before functional code. Red → Green → Refactor.</p>
      </section>

      <section className="rule">
        <strong>Pairing rule:</strong> engineers write the test first.
        <span> No implementation before a failing test.</span>
      </section>

      <section className="agent-panel" aria-labelledby="agent-heading">
        <span className="eyebrow">LOCAL AI WORKSPACE</span>
        <h2 id="agent-heading">Ask your AI Agent Router</h2>
        <p className="agent-intro">
          Describe a coding, testing, documentation, or DevOps task. Your
          request will be routed to an agent and processed by your configured
          language model.
        </p>

        <form onSubmit={handleAgentSubmit} className="agent-form">
          <label htmlFor="agent-prompt">What do you want the agent to do?</label>
          <textarea
            id="agent-prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="e.g. Write Vitest tests for a React Button component..."
            rows={5}
            maxLength={10000}
            required
          />

          <div className="agent-controls">
            <div className="agent-select">
              <label htmlFor="agent-select">Agent</label>
              <select
                id="agent-select"
                value={selectedAgent}
                onChange={(event) =>
                  setSelectedAgent(event.target.value as 'auto' | AgentId)
                }
              >
                {agentOptions.map((agent) => (
                  <option key={agent.value} value={agent.value}>
                    {agent.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="generate-button"
              type="submit"
              disabled={!prompt.trim() || executing}
            >
              {executing ? 'Generating…' : 'Generate response'}
            </button>
          </div>
        </form>

        {executing && (
          <p className="agent-status" role="status">
            Your agent is working. This may take a little while for local models.
          </p>
        )}

        {agentError && <p className="agent-error" role="alert">{agentError}</p>}

        {result && (
          <section className="agent-result" aria-labelledby="result-heading">
            <div className="result-heading">
              <div>
                <span className="eyebrow">AGENT RESPONSE</span>
                <h3 id="result-heading">
                  {agentOptions.find(
                    (agent) => agent.value === result.routing.requestedAgent,
                  )?.label ?? result.routing.requestedAgent}
                </h3>
              </div>
              <span className={`result-status ${result.execution.status}`}>
                {result.execution.status}
              </span>
            </div>

            <p className="result-reason">{result.routing.reason}</p>

            {result.execution.output ? (
              <pre className="agent-output">
                <code>{result.execution.output}</code>
              </pre>
            ) : (
              <p className="agent-error">
                {result.execution.error ?? 'The agent did not return output.'}
              </p>
            )}
            <p className="output-note">
              Generated output is displayed as text. It has not been saved to
              project files or executed automatically.
            </p>
          </section>
        )}
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
