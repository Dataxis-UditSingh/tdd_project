import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getChallenges, getChallenge } from './api';

describe('API client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns challenges from the API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ id: 'one', title: 'One' }],
      }),
    );

    await expect(getChallenges()).resolves.toEqual([{ id: 'one', title: 'One' }]);
  });

  it('throws when a challenge is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 404,
        ok: false,
      }),
    );

    await expect(getChallenge('missing')).rejects.toThrow('Challenge not found');
  });
});
