"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const assert = __importStar(require("node:assert/strict"));
const index_1 = require("./index");
(0, node_test_1.describe)('Shared Skill Scoring Engine', () => {
    (0, node_test_1.it)('computes weighted score accurately according to 25/20/15/15/10/15 weights', () => {
        const result = (0, index_1.calculateWeightedSkillScore)({
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
    (0, node_test_1.it)('assigns correct S/A/B/C/D ranking tiers', () => {
        assert.equal((0, index_1.getRankingTier)(95), 'S');
        assert.equal((0, index_1.getRankingTier)(84), 'A');
        assert.equal((0, index_1.getRankingTier)(75), 'B');
        assert.equal((0, index_1.getRankingTier)(65), 'C');
        assert.equal((0, index_1.getRankingTier)(42), 'D');
    });
});
