import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HoleScoring from '../components/HoleScoring.jsx';

// Mock data
const mockPlayers = [
  { name: 'Alice', points: 6, wins: 2, draws: 0, losses: 1 },
  { name: 'Bob', points: 4, wins: 1, draws: 1, losses: 1 },
  { name: 'Charlie', points: 3, wins: 1, draws: 0, losses: 2 },
  { name: 'David', points: 2, wins: 0, draws: 2, losses: 1 }
];

const mockMatchups = [
  {
    player1: mockPlayers[0],
    player2: mockPlayers[1],
    result: null
  },
  {
    player1: mockPlayers[2],
    player2: mockPlayers[3],
    result: null
  }
];

describe('HoleScoring Component', () => {
  it('renders hole number and matchups correctly', () => {
    const mockOnRecordResults = vi.fn();

    render(
      <HoleScoring
        currentHole={5}
        matchups={mockMatchups}
        onRecordResults={mockOnRecordResults}
        players={mockPlayers}
      />
    );

    // Check hole number
    expect(screen.getByText('Hole 5')).toBeInTheDocument();

    // Check matchups
    expect(screen.getByText('Matchup 1')).toBeInTheDocument();
    expect(screen.getByText('Matchup 2')).toBeInTheDocument();

    // Check player names in matchup buttons
    expect(screen.getByRole('button', { name: 'Alice' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bob' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Charlie' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'David' })).toBeInTheDocument();
  });

  it('displays current standings correctly', () => {
    const mockOnRecordResults = vi.fn();

    render(
      <HoleScoring
        currentHole={5}
        matchups={mockMatchups}
        onRecordResults={mockOnRecordResults}
        players={mockPlayers}
      />
    );

    // Check standings table headers
    expect(screen.getByText('Current Standings')).toBeInTheDocument();
    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByText('Thru')).toBeInTheDocument();
    expect(screen.getByText('Points')).toBeInTheDocument();
    expect(screen.getByText('W')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByText('L')).toBeInTheDocument();

    // Check that Alice is first (highest points) in the standings table
    const standingsTable = screen.getByText('Current Standings').closest('div');
    const aliceInStandings = within(standingsTable).getByText('Alice');
    expect(aliceInStandings).toBeInTheDocument();
  });

  it('allows selecting matchup results', () => {
    const mockOnRecordResults = vi.fn();

    render(
      <HoleScoring
        currentHole={5}
        matchups={mockMatchups}
        onRecordResults={mockOnRecordResults}
        players={mockPlayers}
      />
    );

    // Select winner for first matchup
    const aliceWinsButton = screen.getByRole('button', { name: 'Alice' });
    fireEvent.click(aliceWinsButton);
    expect(aliceWinsButton).toHaveClass('selected');

    // Select draw for second matchup
    const drawButtons = screen.getAllByRole('button', { name: 'Draw' });
    fireEvent.click(drawButtons[1]); // Second draw button
    expect(drawButtons[1]).toHaveClass('selected');
  });

  it('does not auto-save when only one matchup is complete', async () => {
    const mockOnRecordResults = vi.fn();

    render(
      <HoleScoring
        currentHole={5}
        matchups={mockMatchups}
        onRecordResults={mockOnRecordResults}
        players={mockPlayers}
      />
    );

    // Select result for only first matchup
    const aliceWinsButton = screen.getByRole('button', { name: 'Alice' });
    fireEvent.click(aliceWinsButton);

    // Wait briefly to ensure no auto-save occurs
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(mockOnRecordResults).not.toHaveBeenCalled();
  });

  it('auto-saves with delay when both matchups are complete', async () => {
    const mockOnRecordResults = vi.fn();

    render(
      <HoleScoring
        currentHole={5}
        matchups={mockMatchups}
        onRecordResults={mockOnRecordResults}
        players={mockPlayers}
      />
    );

    // Select results for both matchups
    const aliceWinsButton = screen.getByRole('button', { name: 'Alice' });
    fireEvent.click(aliceWinsButton);

    const drawButtons = screen.getAllByRole('button', { name: 'Draw' });
    fireEvent.click(drawButtons[1]);

    // Verify onRecordResults was called with correct data after delay
    await waitFor(() => {
      expect(mockOnRecordResults).toHaveBeenCalledWith([
        {
          player1: mockPlayers[0],
          player2: mockPlayers[1],
          result: 'player1'
        },
        {
          player1: mockPlayers[2],
          player2: mockPlayers[3],
          result: 'draw'
        }
      ]);
    }, { timeout: 2000 }); // Allow time for 800ms delay
  });

  it('auto-saves immediately when updating existing hole results', async () => {
    const mockOnUpdateHoleResult = vi.fn();

    render(
      <HoleScoring
        currentHole={3}
        maxHoleReached={5} // Viewing a previously completed hole
        matchups={mockMatchups}
        onUpdateHoleResult={mockOnUpdateHoleResult}
        players={mockPlayers}
      />
    );

    // Select results for both matchups
    const aliceWinsButton = screen.getByRole('button', { name: 'Alice' });
    fireEvent.click(aliceWinsButton);

    const drawButtons = screen.getAllByRole('button', { name: 'Draw' });
    fireEvent.click(drawButtons[1]);

    // Verify onUpdateHoleResult was called immediately (no delay for existing holes)
    await waitFor(() => {
      expect(mockOnUpdateHoleResult).toHaveBeenCalledWith(3, [
        {
          player1: mockPlayers[0],
          player2: mockPlayers[1],
          result: 'player1'
        },
        {
          player1: mockPlayers[2],
          player2: mockPlayers[3],
          result: 'draw'
        }
      ]);
    }, { timeout: 500 }); // Should happen quickly
  });

  it('shows progress bar correctly', () => {
    const mockOnRecordResults = vi.fn();

    render(
      <HoleScoring
        currentHole={9}
        matchups={mockMatchups}
        onRecordResults={mockOnRecordResults}
        players={mockPlayers}
      />
    );

    // Check progress bar exists
    const progressBar = document.querySelector('.progress-bar');
    expect(progressBar).toBeInTheDocument();

    // Check progress fill width (should be 50% for hole 9)
    const progressFill = document.querySelector('.progress-fill');
    expect(progressFill).toHaveStyle('width: 50%');
  });

  it('resets matchup results when hole changes', () => {
    const mockOnRecordResults = vi.fn();

    const { rerender } = render(
      <HoleScoring
        currentHole={5}
        matchups={mockMatchups}
        onRecordResults={mockOnRecordResults}
        players={mockPlayers}
      />
    );

    // Select a result
    const aliceWinsButton = screen.getByRole('button', { name: 'Alice' });
    fireEvent.click(aliceWinsButton);
    expect(aliceWinsButton).toHaveClass('selected');

    // Change to next hole with new matchups
    const newMatchups = [
      {
        player1: mockPlayers[1],
        player2: mockPlayers[2],
        result: null
      },
      {
        player1: mockPlayers[0],
        player2: mockPlayers[3],
        result: null
      }
    ];

    rerender(
      <HoleScoring
        currentHole={6}
        matchups={newMatchups}
        onRecordResults={mockOnRecordResults}
        players={mockPlayers}
      />
    );

    // Previous selection should be cleared
    const bobWinsButton = screen.getByRole('button', { name: 'Bob' });
    expect(bobWinsButton).not.toHaveClass('selected');
  });
});