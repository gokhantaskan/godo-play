/* server/utils/recommendationUtils.ts */
export const DEFAULT_TAG_WEIGHT = 1;
export const DEFAULT_GAME_MODE_WEIGHT = 1;
export const HIGH_WEIGHT_THRESHOLD = 3;
export const HIGH_WEIGHT_MULTIPLIER = 5;
export const RECOMMENDATIONS_LIMIT = 6;

export interface TagRelation {
  tagId: number;
}

export interface GameModeRelation {
  gameModeId: number;
}

export interface RecommendationCandidate<T = any> {
  game: T;
  tags?: Array<TagRelation>;
  gameSubmissionGameModes?: Array<GameModeRelation>;
}

/**
 * Calculates the recommendation score for a candidate game based on matching tags and game modes.
 * @param candidate - The game candidate with its tags and game modes.
 * @param sourceTagIds - Array of tag IDs from the source game.
 * @param sourceGameModeIds - Array of game mode IDs from the source game.
 * @param tagWeightMap - Map containing weight for each tag ID.
 * @param gameModeWeightMap - Map containing weight for each game mode ID.
 * @returns The calculated score as a number.
 */
export function calculateScoreForCandidate(
  candidate: RecommendationCandidate<any>,
  sourceTagIds: number[],
  sourceGameModeIds: number[],
  tagWeightMap: Map<number, number>,
  gameModeWeightMap: Map<number, number>
): number {
  let gameModeScore = 0;
  let hasHighWeightModes = false;
  let highestModeWeight = 0;

  if (sourceGameModeIds.length > 0 && candidate.gameSubmissionGameModes) {
    candidate.gameSubmissionGameModes.forEach(mode => {
      if (sourceGameModeIds.includes(mode.gameModeId)) {
        const weight =
          gameModeWeightMap.get(mode.gameModeId) || DEFAULT_GAME_MODE_WEIGHT;

        if (weight >= HIGH_WEIGHT_THRESHOLD) {
          gameModeScore += weight * HIGH_WEIGHT_MULTIPLIER;
          hasHighWeightModes = true;
          highestModeWeight = Math.max(highestModeWeight, weight);
        } else {
          gameModeScore += weight;
        }
      }
    });
  }

  let tagScore = 0;
  let hasHighWeightTags = false;
  let highestTagWeight = 0;

  if (sourceTagIds.length > 0 && candidate.tags) {
    candidate.tags.forEach(tag => {
      if (sourceTagIds.includes(tag.tagId)) {
        const weight = tagWeightMap.get(tag.tagId) || DEFAULT_TAG_WEIGHT;

        if (weight >= HIGH_WEIGHT_THRESHOLD) {
          tagScore += weight * HIGH_WEIGHT_MULTIPLIER;
          hasHighWeightTags = true;
          highestTagWeight = Math.max(highestTagWeight, weight);
        } else {
          tagScore += weight;
        }
      }
    });
  }

  let score = 0;

  if (hasHighWeightTags) {
    score = highestTagWeight * 1000 + tagScore + gameModeScore;
  } else if (hasHighWeightModes) {
    score = highestModeWeight * 1000 + tagScore + gameModeScore;
  } else {
    score = tagScore + gameModeScore;
  }

  return score;
}
