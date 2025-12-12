import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PointsTable from './PointsTable.jsx';

describe('PointsTable', () => {
  const mockPlayers = [
    { name: 'Alice', points: 9, wins: 3, draws: 0, losses: 0 },
    { name: 'Bob', points: 6, wins: 2, draws: 0, losses: 1 },
    { name: 'Charlie', points: 3, wins: 1, draws: 0, losses: 2 },
    { name: 'David', points: 3, wins: 0, draws: 3, losses: 0 }
  ];

  it('renders table with correct headers', () => {
    render(<PointsTable players={mockPlayers} currentHole={4} />);

    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByText('Pts')).toBeInTheDocument();
    expect(screen.getByText('W-D-L')).toBeInTheDocument();
  });

  it('renders position column when showPosition is true', () => {
    render(<PointsTable players={mockPlayers} currentHole={4} showPosition={true} />);

    expect(screen.getByText('#')).toBeInTheDocument();
  });

  it('does not render position column when showPosition is false', () => {
    render(<PointsTable players={mockPlayers} currentHole={4} showPosition={false} />);

    expect(screen.queryByText('#')).not.toBeInTheDocument();
  });

  it('displays all players with correct stats', () => {
    render(<PointsTable players={mockPlayers} currentHole={4} />);

    // Check that all players are displayed
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('David')).toBeInTheDocument();

    // Check points are displayed
    expect(screen.getByText('9')).toBeInTheDocument(); // Alice's points
    expect(screen.getByText('6')).toBeInTheDocument(); // Bob's points
  });

  it('sorts players by points (highest first)', () => {
    render(<PointsTable players={mockPlayers} currentHole={4} />);
    
    const playerRows = screen.getAllByText(/Alice|Bob|Charlie|David/);
    
    // Alice (9 points) should be first
    expect(playerRows[0]).toHaveTextContent('Alice');
    // Bob (6 points) should be second
    expect(playerRows[1]).toHaveTextContent('Bob');
  });

  it('sorts players alphabetically when points are equal', () => {
    render(<PointsTable players={mockPlayers} currentHole={4} />);
    
    const playerRows = screen.getAllByText(/Charlie|David/);
    
    // Both Charlie and David have 3 points, so Charlie should come first alphabetically
    const charlieIndex = Array.from(screen.getAllByText(/Alice|Bob|Charlie|David/))
      .findIndex(el => el.textContent.includes('Charlie'));
    const davidIndex = Array.from(screen.getAllByText(/Alice|Bob|Charlie|David/))
      .findIndex(el => el.textContent.includes('David'));
    
    expect(charlieIndex).toBeLessThan(davidIndex);
  });

  it('highlights winner when showWinnerHighlight is true', () => {
    render(<PointsTable players={mockPlayers} currentHole={4} showWinnerHighlight={true} />);
    
    // Alice has the highest points (9), so her row should have winner class
    const aliceRow = screen.getByText('Alice').closest('.points-table-row');
    expect(aliceRow).toHaveClass('winner-row');
  });

  it('highlights multiple winners when tied for highest points', () => {
    const tiedPlayers = [
      { name: 'Alice', points: 6, wins: 2, draws: 0, losses: 1 },
      { name: 'Bob', points: 6, wins: 2, draws: 0, losses: 1 },
      { name: 'Charlie', points: 3, wins: 1, draws: 0, losses: 2 },
      { name: 'David', points: 3, wins: 0, draws: 3, losses: 0 }
    ];

    render(<PointsTable players={tiedPlayers} currentHole={4} showWinnerHighlight={true} />);
    
    // Both Alice and Bob have 6 points, so both should be highlighted
    const aliceRow = screen.getByText('Alice').closest('.points-table-row');
    const bobRow = screen.getByText('Bob').closest('.points-table-row');
    
    expect(aliceRow).toHaveClass('winner-row');
    expect(bobRow).toHaveClass('winner-row');
  });

  it('does not highlight winner when showWinnerHighlight is false', () => {
    render(<PointsTable players={mockPlayers} currentHole={4} showWinnerHighlight={false} />);

    // No rows should have winner class
    const winnerRows = document.querySelectorAll('.winner-row');
    expect(winnerRows).toHaveLength(0);
  });

  it('highlights leader with badge when showPosition is true', () => {
    render(<PointsTable players={mockPlayers} currentHole={4} showPosition={true} />);

    // Alice has the highest points (9), so her row should have leader class
    const aliceRow = screen.getByText('Alice').closest('.points-table-row');
    expect(aliceRow).toHaveClass('leader-row');

    // Leader should have a badge
    const leaderBadge = aliceRow.querySelector('.leader-badge');
    expect(leaderBadge).toBeInTheDocument();
    expect(leaderBadge).toHaveTextContent('1');
  });

  it('shows correct position numbers with ties', () => {
    const tiedPlayers = [
      { name: 'Alice', points: 6, wins: 2, draws: 0, losses: 1 },
      { name: 'Bob', points: 6, wins: 2, draws: 0, losses: 1 },
      { name: 'Charlie', points: 3, wins: 1, draws: 0, losses: 2 },
      { name: 'David', points: 0, wins: 0, draws: 0, losses: 3 }
    ];

    render(<PointsTable players={tiedPlayers} currentHole={4} showPosition={true} />);

    // Both Alice and Bob should be position 1 (tied for lead)
    const aliceRow = screen.getByText('Alice').closest('.points-table-row');
    const bobRow = screen.getByText('Bob').closest('.points-table-row');

    // Both should have leader badges with position 1
    expect(aliceRow.querySelector('.leader-badge')).toHaveTextContent('1');
    expect(bobRow.querySelector('.leader-badge')).toHaveTextContent('1');

    // Charlie should be position 3 (skipping 2 due to tie)
    const charlieRow = screen.getByText('Charlie').closest('.points-table-row');
    expect(charlieRow.querySelector('.cell-pos')).toHaveTextContent('3');
  });

  it('handles empty players array gracefully', () => {
    render(<PointsTable players={[]} currentHole={1} />);

    // Headers should still be present
    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByText('Pts')).toBeInTheDocument();
    expect(screen.getByText('W-D-L')).toBeInTheDocument();

    // No player rows should be present
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <PointsTable players={mockPlayers} currentHole={4} className="custom-class" />
    );
    
    const tableContainer = container.querySelector('.points-table-container');
    expect(tableContainer).toHaveClass('custom-class');
  });

  it('displays correct win/draw/loss statistics', () => {
    render(<PointsTable players={mockPlayers} currentHole={4} />);
    
    // Check Alice's stats (3 wins, 0 draws, 0 losses)
    const aliceRow = screen.getByText('Alice').closest('.points-table-row');
    expect(aliceRow).toHaveTextContent('3'); // wins
    expect(aliceRow).toHaveTextContent('0'); // draws and losses
    
    // Check David's stats (0 wins, 3 draws, 0 losses)
    const davidRow = screen.getByText('David').closest('.points-table-row');
    expect(davidRow).toHaveTextContent('0'); // wins and losses
    expect(davidRow).toHaveTextContent('3'); // draws
  });
});