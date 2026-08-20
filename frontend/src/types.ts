export type Challenge = {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  concepts: string[];
  steps: string[];
};
