# AI Agent Router Foundation

This is a configuration and routing foundation only. No real agent execution or LLM calls are implemented.

## Endpoints

- `GET /api/agent-router/status` — reports router configuration and placeholder agents.
- `POST /api/agent-router/route` — selects an agent using simple keyword rules or `preferredAgent`, then returns `agent_not_implemented`.

Example request:

```json
{
  "message": "Help me debug this React component"
}
```

Example explicit selection:

```json
{
  "message": "Please handle this request",
  "preferredAgent": "testing"
}
```

Supported IDs: `coding`, `testing`, `devops`, `documentation`, `general`.

## Environment

Copy the following variables into your local environment if desired. Defaults are safe for local development.

```dotenv
AGENT_ROUTER_ENABLED=true
AGENT_ROUTER_PROVIDER=none
AGENT_ROUTER_DEFAULT_AGENT=general
```

`AGENT_ROUTER_PROVIDER=none` means no LLM provider is connected. Routing currently uses a small keyword classifier. The provider setting is reserved for a future adapter; changing it does not connect a model.

## Future integration

1. Implement an LLM provider adapter behind a typed interface.
2. Add structured classification with schema validation and a timeout.
3. Implement agents behind a common interface and register them in `registry.ts`.
4. Add explicit permissions and approval gates before allowing tools, filesystem writes, shell commands, or deployments.
5. Add provider and agent integration tests before enabling execution.

Do not put secrets in source control or log user prompts by default.
