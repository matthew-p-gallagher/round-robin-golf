import { useMemo } from 'react';

/**
 * PointsTable component for displaying detailed player statistics
 * @param {Object} props
 * @param {Player[]} props.players - Array of players with current stats
 * @param {number} props.currentHole - Current hole number for calculating "Thru" values
 * @param {boolean} props.showWinnerHighlight - Whether to highlight the winner(s)
 * @param {string} props.className - Additional CSS classes
 */
function PointsTable({ 
  players, 
  currentHole = 1, 
  showWinnerHighlight = false, 
  className = '' 
}) {
  /**
   * Calculate sorted players with ranking and "Thru" values
   */
  const sortedPlayersWithStats = useMemo(() => {
    return [...players]
      .map(player => ({
        ...player,
        thru: currentHole - 1 // Holes completed (current hole - 1)
      }))
      .sort((a, b) => {
        // Sort by points (highest first)
        if (b.points !== a.points) {
          return b.points - a.points;
        }
        // If points are equal, sort alphabetically
        return a.name.localeCompare(b.name);
      });
  }, [players, currentHole]);

  /**
   * Determine if a player should be highlighted as winner
   */
  const isWinner = useMemo(() => {
    if (!showWinnerHighlight || sortedPlayersWithStats.length === 0) {
      return () => false;
    }
    
    const highestPoints = sortedPlayersWithStats[0].points;
    return (player) => player.points === highestPoints;
  }, [sortedPlayersWithStats, showWinnerHighlight]);

  /**
   * Get CSS class for a player row
   */
  const getRowClass = (player) => {
    const baseClass = 'points-table-row';
    if (isWinner(player)) {
      return `${baseClass} winner-row`;
    }
    return baseClass;
  };

  return (
    <div className={`points-table-container ${className}`}>
      <div className="points-table">
        {/* Table Header */}
        <div className="points-table-header">
          <span className="header-player">Player</span>
          <span className="header-thru">Thru</span>
          <span className="header-points">Points</span>
          <span className="header-wins">W</span>
          <span className="header-draws">D</span>
          <span className="header-losses">L</span>
        </div>

        {/* Table Rows */}
        {sortedPlayersWithStats.map((player) => (
          <div key={player.name} className={getRowClass(player)}>
            <span className="cell-player">{player.name}</span>
            <span className="cell-thru">{player.thru}</span>
            <span className="cell-points">{player.points}</span>
            <span className="cell-wins">{player.wins}</span>
            <span className="cell-draws">{player.draws}</span>
            <span className="cell-losses">{player.losses}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PointsTable;