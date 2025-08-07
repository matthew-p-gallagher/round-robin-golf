import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App.jsx';

describe('MatchSetup Integration', () => {
  it('integrates properly with App component and useMatchState hook', async () => {
    render(<App />);
    
    // Should start in setup phase
    expect(screen.getByText('Setup New Match')).toBeInTheDocument();
    expect(screen.getByLabelText('Player 1')).toBeInTheDocument();
    
    // Fill in player names
    fireEvent.change(screen.getByLabelText('Player 1'), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText('Player 2'), { target: { value: 'Bob' } });
    fireEvent.change(screen.getByLabelText('Player 3'), { target: { value: 'Charlie' } });
    fireEvent.change(screen.getByLabelText('Player 4'), { target: { value: 'David' } });
    
    // Start the match
    fireEvent.click(screen.getByRole('button', { name: 'Start Match' }));
    
    // Should transition to scoring phase
    await waitFor(() => {
      expect(screen.getByText('Hole 1')).toBeInTheDocument();
      expect(screen.getByText('Current Standings')).toBeInTheDocument();
      expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Bob').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Charlie').length).toBeGreaterThan(0);
      expect(screen.getAllByText('David').length).toBeGreaterThan(0);
    });
    
    // Setup form should no longer be visible
    expect(screen.queryByText('Setup New Match')).not.toBeInTheDocument();
  });

  it('handles validation errors properly in integration', async () => {
    render(<App />);
    
    // Try to start match without filling names
    fireEvent.click(screen.getByRole('button', { name: 'Start Match' }));
    
    // Should show validation error and stay in setup phase
    await waitFor(() => {
      expect(screen.getByText('All player names must be filled in')).toBeInTheDocument();
    });
    
    // Should still be in setup phase
    expect(screen.getByText('Setup New Match')).toBeInTheDocument();
    expect(screen.queryByText('Hole 1')).not.toBeInTheDocument();
  });
});