import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMatchState } from '../../hooks/useMatchState.js';
import { validPlayerNames } from '../fixtures/mock-data.js';

describe('Backward Navigation Integration Tests', () => {
  let result;

  beforeEach(() => {
    const { result: hookResult } = renderHook(() => useMatchState());
    result = hookResult;
  });

  describe('Navigate Back and Edit Previous Holes', () => {
    beforeEach(() => {
      // Start match and complete first 3 holes with specific results
      act(() => {
        result.current.startMatch(validPlayerNames);
      });

      // Complete hole 1: Alice wins both matchups
      const hole1Matchups = result.current.getCurrentMatchups();
      act(() => {
        result.current.recordHoleResult([
          { ...hole1Matchups[0], result: 'player1' }, // Alice wins
          { ...hole1Matchups[1], result: 'player1' } // Alice wins
        ]);
      });

      // Complete hole 2: All draws
      const hole2Matchups = result.current.getCurrentMatchups();
      act(() => {
        result.current.recordHoleResult([
          { ...hole2Matchups[0], result: 'draw' },
          { ...hole2Matchups[1], result: 'draw' }
        ]);
      });

      // Complete hole 3: Bob wins both
      const hole3Matchups = result.current.getCurrentMatchups();
      act(() => {
        result.current.recordHoleResult([
          { ...hole3Matchups[0], result: 'player2' }, // Assuming Bob is player2 in first matchup
          { ...hole3Matchups[1], result: 'player1' } // Assuming Bob is player1 in second matchup
        ]);
      });

      // Should now be on hole 4
      expect(result.current.matchState.currentHole).toBe(4);
      expect(result.current.matchState.maxHoleReached).toBe(4);
    });

    it('should allow navigating back to previous holes', () => {
      // Navigate back to hole 2
      act(() => {
        result.current.navigateToHole(2);
      });

      expect(result.current.matchState.currentHole).toBe(2);
      expect(result.current.matchState.maxHoleReached).toBe(4); // Should not change
    });

    it('should prevent navigating beyond maxHoleReached', () => {
      expect(() => {
        act(() => {
          result.current.navigateToHole(5);
        });
      }).toThrow('Cannot navigate beyond hole 4');
    });

    it('should show existing results when navigating to completed hole', () => {
      // Navigate to hole 1 and get matchups
      act(() => {
        result.current.navigateToHole(1);
      });

      const hole1Matchups = result.current.getMatchupsForHole(1);
      
      // Should have the results we recorded earlier
      expect(hole1Matchups[0].result).toBe('player1');
      expect(hole1Matchups[1].result).toBe('player1');
    });

    it('should recalculate player stats when editing previous hole', () => {
      // Get initial stats after 3 holes
      const initialStats = result.current.calculatePlayerStats();
      const initialAlicePoints = initialStats.find(p => p.name === validPlayerNames[0]).points;

      // Navigate back to hole 1
      act(() => {
        result.current.navigateToHole(1);
      });

      // Change hole 1 results from Alice winning both to all draws
      const hole1Matchups = result.current.getMatchupsForHole(1);
      act(() => {
        result.current.updateHoleResult(1, [
          { ...hole1Matchups[0], result: 'draw' },
          { ...hole1Matchups[1], result: 'draw' }
        ]);
      });

      // Check that stats were recalculated
      const updatedStats = result.current.calculatePlayerStats();
      const updatedAlicePoints = updatedStats.find(p => p.name === validPlayerNames[0]).points;

      // Alice should have fewer points now (lost 4 points from wins, gained 2 from draws = -2 total)
      expect(updatedAlicePoints).toBe(initialAlicePoints - 2);
    });

    it('should maintain navigation state when editing hole results', () => {
      // Navigate to hole 2
      act(() => {
        result.current.navigateToHole(2);
      });

      const hole2Matchups = result.current.getMatchupsForHole(2);
      
      // Update results on hole 2
      act(() => {
        result.current.updateHoleResult(2, [
          { ...hole2Matchups[0], result: 'player1' },
          { ...hole2Matchups[1], result: 'player2' }
        ]);
      });

      // Should still be on hole 2, maxHoleReached unchanged
      expect(result.current.matchState.currentHole).toBe(2);
      expect(result.current.matchState.maxHoleReached).toBe(4);
    });

    it('should persist edited results in holeResults array', () => {
      // Navigate to hole 1 and edit
      act(() => {
        result.current.navigateToHole(1);
      });

      const hole1Matchups = result.current.getMatchupsForHole(1);
      act(() => {
        result.current.updateHoleResult(1, [
          { ...hole1Matchups[0], result: 'draw' },
          { ...hole1Matchups[1], result: 'player2' }
        ]);
      });

      // Check that holeResults array was updated
      const holeResult = result.current.matchState.holeResults.find(hr => hr.holeNumber === 1);
      expect(holeResult).toBeDefined();
      expect(holeResult.matchups[0].result).toBe('draw');
      expect(holeResult.matchups[1].result).toBe('player2');
    });

    it('should allow returning to current frontier after editing', () => {
      // Navigate back to hole 1
      act(() => {
        result.current.navigateToHole(1);
      });

      // Edit the hole
      const hole1Matchups = result.current.getMatchupsForHole(1);
      act(() => {
        result.current.updateHoleResult(1, [
          { ...hole1Matchups[0], result: 'draw' },
          { ...hole1Matchups[1], result: 'draw' }
        ]);
      });

      // Navigate back to the current frontier
      act(() => {
        result.current.navigateToHole(4);
      });

      expect(result.current.matchState.currentHole).toBe(4);
      
      // Should get fresh matchups for hole 4 (no existing results)
      const hole4Matchups = result.current.getCurrentMatchups();
      expect(hole4Matchups[0].result).toBeNull();
      expect(hole4Matchups[1].result).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle editing the same hole multiple times', () => {
      // Start match and complete hole 1
      act(() => {
        result.current.startMatch(validPlayerNames);
      });

      const hole1Matchups = result.current.getCurrentMatchups();
      act(() => {
        result.current.recordHoleResult([
          { ...hole1Matchups[0], result: 'player1' },
          { ...hole1Matchups[1], result: 'player2' }
        ]);
      });

      // Navigate back and edit multiple times
      act(() => {
        result.current.navigateToHole(1);
      });

      // First edit
      const editMatchups1 = result.current.getMatchupsForHole(1);
      act(() => {
        result.current.updateHoleResult(1, [
          { ...editMatchups1[0], result: 'draw' },
          { ...editMatchups1[1], result: 'draw' }
        ]);
      });

      // Second edit
      const editMatchups2 = result.current.getMatchupsForHole(1);
      act(() => {
        result.current.updateHoleResult(1, [
          { ...editMatchups2[0], result: 'player2' },
          { ...editMatchups2[1], result: 'player1' }
        ]);
      });

      // Verify final results
      const finalMatchups = result.current.getMatchupsForHole(1);
      expect(finalMatchups[0].result).toBe('player2');
      expect(finalMatchups[1].result).toBe('player1');
    });

    it('should handle invalid navigation attempts', () => {
      act(() => {
        result.current.startMatch(validPlayerNames);
      });

      // Try to navigate to hole 0
      expect(() => {
        act(() => {
          result.current.navigateToHole(0);
        });
      }).toThrow('Hole number must be between 1 and 18');

      // Try to navigate to hole 19
      expect(() => {
        act(() => {
          result.current.navigateToHole(19);
        });
      }).toThrow('Hole number must be between 1 and 18');
    });
  });
});