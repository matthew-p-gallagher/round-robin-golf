import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App.jsx';

describe('HoleScoring Integration', () => {
  it('integrates correctly with the main app flow', async () => {
    render(<App />);

    // Start with match setup
    expect(screen.getByText('Setup New Match')).toBeInTheDocument();

    // Fill in player names
    const playerInputs = screen.getAllByRole('textbox');
    fireEvent.change(playerInputs[0], { target: { value: 'Alice' } });
    fireEvent.change(playerInputs[1], { target: { value: 'Bob' } });
    fireEvent.change(playerInputs[2], { target: { value: 'Charlie' } });
    fireEvent.change(playerInputs[3], { target: { value: 'David' } });

    // Start the match
    const startButton = screen.getByRole('button', { name: /start match/i });
    fireEvent.click(startButton);

    // Should now be on hole scoring screen
    await waitFor(() => {
      expect(screen.getByText('Hole 1')).toBeInTheDocument();
    });

    // Check that matchups are displayed
    expect(screen.getByText('Matchup 1')).toBeInTheDocument();
    expect(screen.getByText('Matchup 2')).toBeInTheDocument();

    // Check that current standings are shown
    expect(screen.getByText('Current Standings')).toBeInTheDocument();

    // Initially all players should have 0 points
    const pointsElements = screen.getAllByText('0');
    expect(pointsElements.length).toBeGreaterThan(0);

    // Select results for both matchups
    const aliceWinsButton = screen.getByRole('button', { name: 'Alice' });
    fireEvent.click(aliceWinsButton);

    const drawButtons = screen.getAllByRole('button', { name: 'Draw' });
    fireEvent.click(drawButtons[1]); // Second draw button

    // Should advance to hole 2
    await waitFor(() => {
      expect(screen.getByText('Hole 2')).toBeInTheDocument();
    });

    // Check that points were updated (Alice should have 3 points, Charlie and David should have 1 each)
    expect(screen.getByText('3')).toBeInTheDocument(); // Alice's points
  });

  it('shows correct progress bar on different holes', async () => {
    render(<App />);

    // Setup match
    const playerInputs = screen.getAllByRole('textbox');
    fireEvent.change(playerInputs[0], { target: { value: 'Alice' } });
    fireEvent.change(playerInputs[1], { target: { value: 'Bob' } });
    fireEvent.change(playerInputs[2], { target: { value: 'Charlie' } });
    fireEvent.change(playerInputs[3], { target: { value: 'David' } });

    const startButton = screen.getByRole('button', { name: /start match/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('Hole 1')).toBeInTheDocument();
    });

    // Check progress bar exists
    const progressBar = document.querySelector('.progress-bar');
    expect(progressBar).toBeInTheDocument();

    // Progress fill should be approximately 5.56% for hole 1
    const progressFill = document.querySelector('.progress-fill');
    expect(progressFill).toHaveStyle('width: 5.555555555555555%');
  });
});