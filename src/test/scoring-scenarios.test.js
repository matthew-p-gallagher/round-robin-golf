import { describe, it, expect } from 'vitest';
import { processHoleResult, updatePlayerStats, calculateHolesCompleted, sortPlayersByRanking, createPlayer } from '../utils/player-stats.js';

describe('Comprehensive Scoring Scenarios', () => {
  describe('Points Calculation Edge Cases', () => {
    it('should handle multiple wins accumulating correctly', () => {
      let player = createPlayer('Alice');
      
      // Win 5 holes
      for (let i = 0; i < 5; i++) {
        player = updatePlayerStats(player, 'win');
      }
      
      expect(player.points).toBe(15); // 5 wins * 3 points
      expect(player.wins).toBe(5);
      expect(player.draws).toBe(0);
      expect(player.losses).toBe(0);
    });

    it('should handle multiple draws accumulating correctly', () => {
      let player = createPlayer('Bob');
      
      // Draw 8 holes
      for (let i = 0; i < 8; i++) {
        player = updatePlayerStats(player, 'draw');
      }
      
      expect(player.points).toBe(8); // 8 draws * 1 point
      expect(player.wins).toBe(0);
      expect(player.draws).toBe(8);
      expect(player.losses).toBe(0);
    });

    it('should handle mixed results correctly', () => {
      let player = createPlayer('Charlie');
      
      // 3 wins, 4 draws, 2 losses
      for (let i = 0; i < 3; i++) {
        player = updatePlayerStats(player, 'win');
      }
      for (let i = 0; i < 4; i++) {
        player = updatePlayerStats(player, 'draw');
      }
      for (let i = 0; i < 2; i++) {
        player = updatePlayerStats(player, 'loss');
      }
      
      expect(player.points).toBe(13); // (3 * 3) + (4 * 1) + (2 * 0) = 13
      expect(player.wins).toBe(3);
      expect(player.draws).toBe(4);
      expect(player.losses).toBe(2);
      expect(calculateHolesCompleted(player)).toBe(9); // 3 + 4 + 2
    });
  });

  describe('Full 18-Hole Match Scenarios', () => {
    const players = [
      createPlayer('Alice'),
      createPlayer('Bob'), 
      createPlayer('Charlie'),
      createPlayer('David')
    ];

    it('should handle scenario where one player wins all matchups', () => {
      let currentPlayers = [...players];
      
      // Alice wins every hole for 18 holes
      for (let hole = 1; hole <= 18; hole++) {
        const matchups = [
          { player1: currentPlayers[0], player2: currentPlayers[1], result: 'player1' }, // Alice beats Bob
          { player1: currentPlayers[2], player2: currentPlayers[3], result: 'draw' }      // Charlie draws David
        ];
        
        currentPlayers = processHoleResult(currentPlayers, matchups);
      }
      
      const alice = currentPlayers.find(p => p.name === 'Alice');
      const bob = currentPlayers.find(p => p.name === 'Bob');
      const charlie = currentPlayers.find(p => p.name === 'Charlie');
      const david = currentPlayers.find(p => p.name === 'David');
      
      expect(alice.points).toBe(54); // 18 wins * 3 points
      expect(alice.wins).toBe(18);
      expect(alice.losses).toBe(0);
      
      expect(bob.points).toBe(0); // 18 losses * 0 points
      expect(bob.losses).toBe(18);
      expect(bob.wins).toBe(0);
      
      expect(charlie.points).toBe(18); // 18 draws * 1 point
      expect(charlie.draws).toBe(18);
      
      expect(david.points).toBe(18); // 18 draws * 1 point
      expect(david.draws).toBe(18);
    });

    it('should handle scenario with all draws', () => {
      let currentPlayers = [...players];
      
      // All matchups are draws for 18 holes
      for (let hole = 1; hole <= 18; hole++) {
        const matchups = [
          { player1: currentPlayers[0], player2: currentPlayers[1], result: 'draw' },
          { player1: currentPlayers[2], player2: currentPlayers[3], result: 'draw' }
        ];
        
        currentPlayers = processHoleResult(currentPlayers, matchups);
      }
      
      // All players should have equal stats
      currentPlayers.forEach(player => {
        expect(player.points).toBe(18); // 18 draws * 1 point
        expect(player.wins).toBe(0);
        expect(player.draws).toBe(18);
        expect(player.losses).toBe(0);
        expect(calculateHolesCompleted(player)).toBe(18);
      });
    });

    it('should handle realistic mixed scenario', () => {
      let currentPlayers = [...players];
      
      // Simulate a realistic 18-hole match with varied results
      const holeResults = [
        // Hole 1: Alice beats Bob, Charlie beats David
        [{ player1: currentPlayers[0], player2: currentPlayers[1], result: 'player1' },
         { player1: currentPlayers[2], player2: currentPlayers[3], result: 'player1' }],
        
        // Hole 2: Alice draws Charlie, Bob beats David  
        [{ player1: currentPlayers[0], player2: currentPlayers[2], result: 'draw' },
         { player1: currentPlayers[1], player2: currentPlayers[3], result: 'player1' }],
         
        // Hole 3: Alice beats David, Bob draws Charlie
        [{ player1: currentPlayers[0], player2: currentPlayers[3], result: 'player1' },
         { player1: currentPlayers[1], player2: currentPlayers[2], result: 'draw' }],
         
        // Continue pattern for remaining holes...
        // For brevity, let's simulate 6 more holes with similar patterns
      ];
      
      // Add more holes to reach 9 total (simplified for test)
      for (let i = 0; i < 6; i++) {
        holeResults.push([
          { player1: currentPlayers[0], player2: currentPlayers[1], result: 'player1' }, // Alice wins
          { player1: currentPlayers[2], player2: currentPlayers[3], result: 'draw' }      // Draw
        ]);
      }
      
      // Process all hole results
      holeResults.forEach(matchups => {
        currentPlayers = processHoleResult(currentPlayers, matchups);
      });
      
      const alice = currentPlayers.find(p => p.name === 'Alice');
      const bob = currentPlayers.find(p => p.name === 'Bob');
      const charlie = currentPlayers.find(p => p.name === 'Charlie');
      const david = currentPlayers.find(p => p.name === 'David');
      
      // Verify Alice has the most points (she won 8 out of 9 holes)
      expect(alice.points).toBeGreaterThan(bob.points);
      expect(alice.points).toBeGreaterThan(charlie.points);
      expect(alice.points).toBeGreaterThan(david.points);
      
      // Verify all players have played 9 holes
      expect(calculateHolesCompleted(alice)).toBe(9);
      expect(calculateHolesCompleted(bob)).toBe(9);
      expect(calculateHolesCompleted(charlie)).toBe(9);
      expect(calculateHolesCompleted(david)).toBe(9);
    });
  });

  describe('Ranking and Tiebreaker Scenarios', () => {
    it('should handle complex ranking with multiple ties', () => {
      const players = [
        { name: 'Zoe', points: 15, wins: 5, draws: 0, losses: 1 },      // 15 points, Z name
        { name: 'Alice', points: 15, wins: 4, draws: 3, losses: 0 },    // 15 points, A name  
        { name: 'Bob', points: 12, wins: 4, draws: 0, losses: 2 },      // 12 points
        { name: 'Charlie', points: 15, wins: 3, draws: 6, losses: 0 },  // 15 points, C name
        { name: 'David', points: 12, wins: 3, draws: 3, losses: 1 }     // 12 points
      ];
      
      const ranked = sortPlayersByRanking(players);
      
      // Should be sorted by points (15 first), then alphabetically within ties
      expect(ranked[0].name).toBe('Alice');   // 15 points, A comes first alphabetically
      expect(ranked[1].name).toBe('Charlie'); // 15 points, C comes second alphabetically  
      expect(ranked[2].name).toBe('Zoe');     // 15 points, Z comes last alphabetically
      expect(ranked[3].name).toBe('Bob');     // 12 points, B comes before D alphabetically
      expect(ranked[4].name).toBe('David');   // 12 points, D comes after B alphabetically
    });

    it('should handle perfect tie scenario', () => {
      const players = [
        { name: 'Delta', points: 10, wins: 2, draws: 4, losses: 0 },
        { name: 'Alpha', points: 10, wins: 3, draws: 1, losses: 2 },
        { name: 'Charlie', points: 10, wins: 1, draws: 7, losses: 0 },
        { name: 'Beta', points: 10, wins: 2, draws: 4, losses: 0 }
      ];
      
      const ranked = sortPlayersByRanking(players);
      
      // All have same points, should be purely alphabetical
      expect(ranked[0].name).toBe('Alpha');
      expect(ranked[1].name).toBe('Beta');
      expect(ranked[2].name).toBe('Charlie');
      expect(ranked[3].name).toBe('Delta');
    });
  });

  describe('Thru Calculation Edge Cases', () => {
    it('should calculate thru correctly for uneven play patterns', () => {
      // Simulate a scenario where players have different numbers of completed holes
      // (This shouldn't happen in normal play, but tests the calculation logic)
      
      const player1 = { name: 'Alice', points: 9, wins: 3, draws: 0, losses: 0 }; // 3 holes
      const player2 = { name: 'Bob', points: 5, wins: 1, draws: 2, losses: 1 };   // 4 holes
      const player3 = { name: 'Charlie', points: 2, wins: 0, draws: 2, losses: 0 }; // 2 holes
      
      expect(calculateHolesCompleted(player1)).toBe(3);
      expect(calculateHolesCompleted(player2)).toBe(4);
      expect(calculateHolesCompleted(player3)).toBe(2);
    });

    it('should handle zero completed holes', () => {
      const newPlayer = createPlayer('NewPlayer');
      expect(calculateHolesCompleted(newPlayer)).toBe(0);
    });

    it('should handle maximum possible holes (18)', () => {
      const player = {
        name: 'MaxPlayer',
        points: 54,
        wins: 18,
        draws: 0,
        losses: 0
      };
      
      expect(calculateHolesCompleted(player)).toBe(18);
    });
  });

  describe('Error Handling in Scoring', () => {
    it('should handle invalid matchup results gracefully', () => {
      const players = [
        createPlayer('Alice'),
        createPlayer('Bob'),
        createPlayer('Charlie'), 
        createPlayer('David')
      ];

      // Test with null result
      const invalidMatchups1 = [
        { player1: players[0], player2: players[1], result: null },
        { player1: players[2], player2: players[3], result: 'draw' }
      ];

      expect(() => processHoleResult(players, invalidMatchups1))
        .toThrow('All matchups must have results before processing');

      // Test with invalid result value
      const invalidMatchups2 = [
        { player1: players[0], player2: players[1], result: 'invalid' },
        { player1: players[2], player2: players[3], result: 'draw' }
      ];

      // This should be caught by the updatePlayerStats function
      expect(() => processHoleResult(players, invalidMatchups2))
        .toThrow();
    });

    it('should handle mismatched player references', () => {
      const players = [
        createPlayer('Alice'),
        createPlayer('Bob'),
        createPlayer('Charlie'),
        createPlayer('David')
      ];

      const outsidePlayer = createPlayer('Outsider');
      
      const invalidMatchups = [
        { player1: players[0], player2: outsidePlayer, result: 'player1' },
        { player1: players[2], player2: players[3], result: 'draw' }
      ];

      expect(() => processHoleResult(players, invalidMatchups))
        .toThrow('Matchup contains players not found in players array');
    });
  });
});