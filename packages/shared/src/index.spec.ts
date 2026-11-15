import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { calculateWeightedSkillScore, getRankingTier } from './index';

describe('Shared Skill Scoring Engine', () => {
  it('computes weighted score accurately according to 25/20/15/15/10/15 weights', () => {
    const result = calculateWeightedSkillScore({
      technicalCapability: 92,
      innovationAndComplexity: 90,
      communityAdoption: 95,
      maintenanceAndUpdates: 94,
      documentationQuality: 90,
      securityAndReliability: 100,
    });

    // 92*0.25 (23) + 90*0.20 (18) + 95*0.15 (14.25) + 94*0.15 (14.1) + 90*0.10 (9) + 100*0.15 (15) = 93.35 -> 93.4
    assert.equal(result.overallScore, 93.4);
    assert.equal(result.rankingTier, 'S');
  });

  it('assigns correct S/A/B/C/D ranking tiers', () => {
    assert.equal(getRankingTier(95), 'S');
    assert.equal(getRankingTier(84), 'A');
    assert.equal(getRankingTier(75), 'B');
    assert.equal(getRankingTier(65), 'C');
    assert.equal(getRankingTier(42), 'D');
  });
});
