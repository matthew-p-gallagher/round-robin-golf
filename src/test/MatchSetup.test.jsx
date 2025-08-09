import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MatchSetup from '../components/MatchSetup.jsx';

describe('MatchSetup Component', () => {
  const mockOnStartMatch = vi.fn();

  beforeEach(() => {
    mockOnStartMatch.mockClear();
  });

  it('renders the match setup form with 4 player input fields', () => {
    render(<MatchSetup onStartMatch={mockOnStartMatch} />);
    
    expect(screen.getByText('Setup New Match')).toBeInTheDocument();
    expect(screen.getByLabelText('Player 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Player 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Player 3')).toBeInTheDocument();
    expect(screen.getByLabelText('Player 4')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start Match' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear All' })).toBeInTheDocument();
  });

  it('updates player names when typing in input fields', () => {
    render(<MatchSetup onStartMatch={mockOnStartMatch} />);
    
    const player1Input = screen.getByLabelText('Player 1');
    fireEvent.change(player1Input, { target: { value: 'Alice' } });
    
    expect(player1Input.value).toBe('Alice');
  });

  it('clears all player names when Clear All button is clicked', () => {
    render(<MatchSetup onStartMatch={mockOnStartMatch} />);
    
    // Fill in some names
    fireEvent.change(screen.getByLabelText('Player 1'), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText('Player 2'), { target: { value: 'Bob' } });
    
    // Click Clear All
    fireEvent.click(screen.getByRole('button', { name: 'Clear All' }));
    
    expect(screen.getByLabelText('Player 1').value).toBe('');
    expect(screen.getByLabelText('Player 2').value).toBe('');
  });

  it('shows validation error when trying to submit with empty names', async () => {
    render(<MatchSetup onStartMatch={mockOnStartMatch} />);
    
    // Try to submit without filling names
    fireEvent.click(screen.getByRole('button', { name: 'Start Match' }));
    
    await waitFor(() => {
      expect(screen.getByText('All player names must be filled in')).toBeInTheDocument();
    });
    
    expect(mockOnStartMatch).not.toHaveBeenCalled();
  });

  it('shows validation error when player names are not unique', async () => {
    render(<MatchSetup onStartMatch={mockOnStartMatch} />);
    
    // Fill in duplicate names
    fireEvent.change(screen.getByLabelText('Player 1'), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText('Player 2'), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText('Player 3'), { target: { value: 'Bob' } });
    fireEvent.change(screen.getByLabelText('Player 4'), { target: { value: 'Charlie' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Start Match' }));
    
    await waitFor(() => {
      expect(screen.getByText('All player names must be unique')).toBeInTheDocument();
    });
    
    expect(mockOnStartMatch).not.toHaveBeenCalled();
  });



  it('calls onStartMatch with trimmed player names when form is valid', async () => {
    render(<MatchSetup onStartMatch={mockOnStartMatch} />);
    
    // Fill in valid names with some whitespace
    fireEvent.change(screen.getByLabelText('Player 1'), { target: { value: ' Alice ' } });
    fireEvent.change(screen.getByLabelText('Player 2'), { target: { value: 'Bob' } });
    fireEvent.change(screen.getByLabelText('Player 3'), { target: { value: 'Charlie ' } });
    fireEvent.change(screen.getByLabelText('Player 4'), { target: { value: ' David' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Start Match' }));
    
    await waitFor(() => {
      expect(mockOnStartMatch).toHaveBeenCalledWith(['Alice', 'Bob', 'Charlie', 'David']);
    });
  });

  it('shows loading state when submitting', async () => {
    // Mock a slow onStartMatch function
    const slowMockOnStartMatch = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<MatchSetup onStartMatch={slowMockOnStartMatch} />);
    
    // Fill in valid names
    fireEvent.change(screen.getByLabelText('Player 1'), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText('Player 2'), { target: { value: 'Bob' } });
    fireEvent.change(screen.getByLabelText('Player 3'), { target: { value: 'Charlie' } });
    fireEvent.change(screen.getByLabelText('Player 4'), { target: { value: 'David' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Start Match' }));
    
    // Check loading state
    expect(screen.getByRole('button', { name: 'Starting Match...' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Starting Match...' })).toBeDisabled();
    
    // Wait for completion
    await waitFor(() => {
      expect(slowMockOnStartMatch).toHaveBeenCalled();
    });
  });

  it('handles errors from onStartMatch callback', async () => {
    const errorMockOnStartMatch = vi.fn(() => {
      throw new Error('Failed to start match');
    });
    render(<MatchSetup onStartMatch={errorMockOnStartMatch} />);
    
    // Fill in valid names
    fireEvent.change(screen.getByLabelText('Player 1'), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText('Player 2'), { target: { value: 'Bob' } });
    fireEvent.change(screen.getByLabelText('Player 3'), { target: { value: 'Charlie' } });
    fireEvent.change(screen.getByLabelText('Player 4'), { target: { value: 'David' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Start Match' }));
    
    await waitFor(() => {
      expect(screen.getByText('Failed to start match')).toBeInTheDocument();
    });
  });

  it('clears errors when user starts typing after validation error', async () => {
    render(<MatchSetup onStartMatch={mockOnStartMatch} />);
    
    // Trigger validation error
    fireEvent.click(screen.getByRole('button', { name: 'Start Match' }));
    
    await waitFor(() => {
      expect(screen.getByText('All player names must be filled in')).toBeInTheDocument();
    });
    
    // Start typing in a field
    fireEvent.change(screen.getByLabelText('Player 1'), { target: { value: 'Alice' } });
    
    // Error should be cleared
    expect(screen.queryByText('All player names must be filled in')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<MatchSetup onStartMatch={mockOnStartMatch} />);
    
    // Check that inputs have proper labels
    expect(screen.getByLabelText('Player 1')).toHaveAttribute('id', 'player-1');
    expect(screen.getByLabelText('Player 2')).toHaveAttribute('id', 'player-2');
    expect(screen.getByLabelText('Player 3')).toHaveAttribute('id', 'player-3');
    expect(screen.getByLabelText('Player 4')).toHaveAttribute('id', 'player-4');
    
    // Check that form has proper structure
    const form = screen.getByRole('form');
    expect(form).toBeInTheDocument();
  });
});