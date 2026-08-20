import type { Challenge } from './types';

export async function getChallenges(): Promise<Challenge[]> {
  const response = await fetch('/api/challenges');

  if (!response.ok) {
    throw new Error('Unable to load challenges');
  }

  return response.json();
}

export async function getChallenge(id: string): Promise<Challenge> {
  const response = await fetch(`/api/challenges/${id}`);

  if (response.status === 404) {
    throw new Error('Challenge not found');
  }

  if (!response.ok) {
    throw new Error('Unable to load challenge');
  }

  return response.json();
}
