export const challenges = [
  {
    id: 'react-counter',
    title: 'Build a Counter',
    description: 'Create a counter by starting with behavior tests, then implement the smallest solution.',
    difficulty: 'Beginner' as const,
    concepts: ['React state', 'Events', 'Component tests'],
    steps: ['Write the failing test', 'Implement the counter', 'Refactor'],
  },
  {
    id: 'api-health',
    title: 'Health Endpoint',
    description: 'Build a predictable health endpoint from an API contract test.',
    difficulty: 'Intermediate' as const,
    concepts: ['Express', 'HTTP', 'Supertest'],
    steps: ['Write the HTTP test', 'Implement GET /api/health', 'Refactor'],
  },
  {
    id: 'challenge-filter',
    title: 'Filter Challenges',
    description: 'Add filtering behavior with tests covering empty, partial, and exact matches.',
    difficulty: 'Advanced' as const,
    concepts: ['TypeScript', 'Pure functions', 'Edge cases'],
    steps: ['Define behavior with tests', 'Implement filtering', 'Refactor'],
  },
] as const;
