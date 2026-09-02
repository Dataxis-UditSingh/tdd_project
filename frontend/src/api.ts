import type { Challenge } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function getChallenges(): Promise<Challenge[]> {
  const response = await fetch(`${API_BASE_URL}/api/challenges`);

  if (!response.ok) {
    throw new Error('Unable to load challenges');
  }

  return response.json();
}

export async function getChallenge(id: string): Promise<Challenge> {
  const response = await fetch(`${API_BASE_URL}/api/challenges/${id}`);

  if (response.status === 404) {
    throw new Error('Challenge not found');
  }

  if (!response.ok) {
    throw new Error('Unable to load challenge');
  }

  return response.json();
}