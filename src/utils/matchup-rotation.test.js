import { describe, it, expect } from 'vitest';
import { 
  getMatchupPattern, 
  createMatchupsForHole, 
  getAllMatchupPatterns 
} from './matchup-rotation.js';

describe('Matchup Rotation Logic', () => {
  const mockPlayers = [
    { name: 'Alice', points: 0, wins: 0, draws: 0, losses: 0 },
    { name: 'Bob', points: 0, wins: 0, draws: 0, losses: 0 },
    { name: 'Charlie', points: 0, wins: 0, draws: 0, losses: 0 },
    { name: 'David', points: 0, wins: 0, draws: 0, losses: 0 }
  ];

  describe('getMatchupPattern', () => {
    it('should return correct pattern for hole 1 (Pattern 1)', () => {
      const pattern = getMatchupPattern(1);
      expect(pattern).toEqual([[0, 1], [2, 3]]);
    });

    it('should return correct pattern for hole 2 (Pattern 2)', () => {
      const pattern = getMatchupPattern(2);
      expect(pattern).toEqual([[0, 2], [1, 3]]);
    });

    it('should return correct pattern for hole 3 (Pattern 3)', () => {
      const pattern = getMatchupPattern(3);
      expect(pattern).toEqual([[0, 3], [1, 2]]);
    });

    it('should cycle back to Pattern 1 for hole 4', () => {
      const pattern = getMatchupPattern(4);
      expect(pattern).toEqual([[0, 1], [2, 3]]);
    });

    it('should cycle back to Pattern 2 for hole 5', () => {
      const pattern = getMatchupPattern(5);
      expect(pattern).toEqual([[0, 2], [1, 3]]);
    });

    it('should cycle back to Pattern 3 for hole 6', () => {
      const pattern = getMatchupPattern(6);
      expect(pattern).toEqual([[0, 3], [1, 2]]);
    });

    it('should handle hole 18 correctly (Pattern 3)', () => {
      const pattern = getMatchupPattern(18);
      expect(pattern).toEqual([[0, 3], [1, 2]]);
    });

    it('should throw error for invalid hole numbers', () => {
      expect(() => getMatchupPattern(0)).toThrow('Hole number must be between 1 and 18');
      expect(() => getMatchupPattern(19)).toThrow('Hole number must be between 1 and 18');
      expect(() => getMatchupPattern(-1)).toThrow('Hole number must be between 1 and 18');
    });
  });

  describe('createMatchupsForHole', () => {
    it('should create correct matchups for hole 1', () => {
      const matchups = createMatchupsForHole(mockPlayers, 1);
      
      expect(matchups).toHaveLength(2);
      expect(matchups[0].player1.name).toBe('Alice');
      expect(matchups[0].player2.name).toBe('Bob');
      expect(matchups[1].player1.name).toBe('Charlie');
      expect(matchups[1].player2.name).toBe('David');
      expect(matchups[0].result).toBeNull();
      expect(matchups[1].result).toBeNull();
    });

    it('should create correct matchups for hole 2', () => {
      const matchups = createMatchupsForHole(mockPlayers, 2);
      
      expect(matchups[0].player1.name).toBe('Alice');
      expect(matchups[0].player2.name).toBe('Charlie');
      expect(matchups[1].player1.name).toBe('Bob');
      expect(matchups[1].player2.name).toBe('David');
    });

    it('should create correct matchups for hole 3', () => {
      const matchups = createMatchupsForHole(mockPlayers, 3);
      
      expect(matchups[0].player1.name).toBe('Alice');
      expect(matchups[0].player2.name).toBe('David');
      expect(matchups[1].player1.name).toBe('Bob');
      expect(matchups[1].player2.name).toBe('Charlie');
    });

    it('should throw error for invalid player count', () => {
      expect(() => createMatchupsForHole([], 1)).toThrow('Must provide exactly 4 players');
      expect(() => createMatchupsForHole([mockPlayers[0]], 1)).toThrow('Must provide exactly 4 players');
      expect(() => createMatchupsForHole([...mockPlayers, mockPlayers[0]], 1)).toThrow('Must provide exactly 4 players');
    });

    it('should throw error for non-array players', () => {
      expect(() => createMatchupsForHole(null, 1)).toThrow('Must provide exactly 4 players');
      expect(() => createMatchupsForHole('invalid', 1)).toThrow('Must provide exactly 4 players');
    });
  });

  describe('getAllMatchupPatterns', () => {
    it('should return patterns for all 18 holes', () => {
      const allPatterns = getAllMatchupPatterns();
      expect(allPatterns).toHaveLength(18);
    });

    it('should cycle through the 3 patterns correctly across all 18 holes', () => {
      const allPatterns = getAllMatchupPatterns();
      
      // Check that the pattern repeats every 3 holes
      for (let i = 0; i < 18; i++) {
        const expectedPatternIndex = i % 3;
        const expectedPatterns = [
          [[0, 1], [2, 3]], // Pattern 1
          [[0, 2], [1, 3]], // Pattern 2  
          [[0, 3], [1, 2]]  // Pattern 3
        ];
        
        expect(allPatterns[i]).toEqual(expectedPatterns[expectedPatternIndex]);
      }
    });

    it('should ensure each player plays against every other player equally', () => {
      const allPatterns = getAllMatchupPatterns();
      const matchupCounts = {};
      
      // Initialize matchup count matrix
      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          const key = `${i}-${j}`;
          matchupCounts[key] = 0;
        }
      }
      
      // Count matchups across all holes
      allPatterns.forEach(pattern => {
        pattern.forEach(matchup => {
          const [p1, p2] = matchup.sort((a, b) => a - b);
          const key = `${p1}-${p2}`;
          matchupCounts[key]++;
        });
      });
      
      // Each pair should play exactly 6 times (18 holes / 3 patterns = 6 cycles)
      Object.values(matchupCounts).forEach(count => {
        expect(count).toBe(6);
      });
    });
  });
});