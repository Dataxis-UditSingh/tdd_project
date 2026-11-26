import { agentRouterConfig } from './config.js';

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface ChatCompletionOptions {
    messages: ChatMessage[];
    temperature?: number;
    format?: unknown;
}

interface OllamaResponse {
    message?: {
        content?: string;
    };
}

interface OpenAIResponse {
    choices?: Array<{
        message?: {
            content?: string;
        };
    }>;
}

export async function generateChatCompletion(
    options: ChatCompletionOptions,
): Promise<string> {
    const { provider } = agentRouterConfig;

    if (provider === 'none') {
        throw new Error('Agent Router LLM provider is disabled');
    }

    const isAgentGateway = provider === 'agentgateway';

    const baseUrl = isAgentGateway
        ? agentRouterConfig.agentgateway.baseUrl
        : agentRouterConfig.ollama.baseUrl;

    const model = isAgentGateway
        ? agentRouterConfig.agentgateway.model
        : agentRouterConfig.ollama.model;

    const timeoutMs = isAgentGateway
        ? agentRouterConfig.agentgateway.timeoutMs
        : agentRouterConfig.ollama.timeoutMs;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const url = isAgentGateway
            ? `${baseUrl.replace(/\/+$/, '')}/v1/chat/completions`
            : `${baseUrl.replace(/\/+$/, '')}/api/chat`;

        const body = isAgentGateway
            ? {
                model,
                messages: options.messages,
                temperature: options.temperature ?? 0.2,
                stream: false,
                ...(options.format !== undefined
                    ? {
                        response_format: {
                            type: 'json_schema',
                            json_schema: {
                                name: 'agent_classification',
                                strict: true,
                                schema: options.format,
                            },
                        },
                    }
                    : {}),
            }
            : {
                model,
                messages: options.messages,
                stream: false,
                options: {
                    temperature: options.temperature ?? 0.2,
                },
                ...(options.format !== undefined
                    ? { format: options.format }
                    : {}),
            };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: controller.signal,
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const providerName =
                provider === 'ollama' ? 'Ollama' : 'AgentGateway';

            const responseBody = await response.text();

            throw new Error(
                `${providerName} returned HTTP ${response.status}: ${responseBody.slice(0, 1000) || response.statusText
                }`,
            );
        }

        if (isAgentGateway) {
            const result = (await response.json()) as OpenAIResponse;
            const content = result.choices?.[0]?.message?.content;

            if (typeof content !== 'string' || !content.trim()) {
                throw new Error('AgentGateway returned an empty response');
            }

            return content.trim();
        }

        const result = (await response.json()) as OllamaResponse;
        const content = result.message?.content;

        if (typeof content !== 'string' || !content.trim()) {
            throw new Error('Ollama returned an empty response');
        }

        return content.trim();
    } finally {
        clearTimeout(timeout);
    }
}