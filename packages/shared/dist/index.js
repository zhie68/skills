"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCORE_WEIGHTS = void 0;
exports.calculateWeightedSkillScore = calculateWeightedSkillScore;
exports.getRankingTier = getRankingTier;
exports.SCORE_WEIGHTS = {
    technicalCapability: 0.25,
    innovationAndComplexity: 0.20,
    communityAdoption: 0.15,
    maintenanceAndUpdates: 0.15,
    documentationQuality: 0.10,
    securityAndReliability: 0.15,
};
function calculateWeightedSkillScore(metrics) {
    const clamp = (val) => Math.max(0, Math.min(100, Math.round(val)));
    const technicalCapability = clamp(metrics.technicalCapability);
    const innovationAndComplexity = clamp(metrics.innovationAndComplexity);
    const communityAdoption = clamp(metrics.communityAdoption);
    const maintenanceAndUpdates = clamp(metrics.maintenanceAndUpdates);
    const documentationQuality = clamp(metrics.documentationQuality);
    const securityAndReliability = clamp(metrics.securityAndReliability);
    const rawOverall = technicalCapability * exports.SCORE_WEIGHTS.technicalCapability +
        innovationAndComplexity * exports.SCORE_WEIGHTS.innovationAndComplexity +
        communityAdoption * exports.SCORE_WEIGHTS.communityAdoption +
        maintenanceAndUpdates * exports.SCORE_WEIGHTS.maintenanceAndUpdates +
        documentationQuality * exports.SCORE_WEIGHTS.documentationQuality +
        securityAndReliability * exports.SCORE_WEIGHTS.securityAndReliability;
    const overallScore = Math.round(rawOverall * 10) / 10;
    const rankingTier = getRankingTier(overallScore);
    return {
        technicalCapability,
        innovationAndComplexity,
        communityAdoption,
        maintenanceAndUpdates,
        documentationQuality,
        securityAndReliability,
        overallScore,
        rankingTier,
    };
}
function getRankingTier(score) {
    if (score >= 90)
        return 'S';
    if (score >= 80)
        return 'A';
    if (score >= 70)
        return 'B';
    if (score >= 60)
        return 'C';
    return 'D';
}
