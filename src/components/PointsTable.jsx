import { useMemo } from 'react';

/**
 * PointsTable component for displaying detailed player statistics
 * @param {Object} props
 * @param {Player[]} props.players - Array of players with current stats
 * @param {number} props.currentHole - Current hole number for calculating "Thru" values
 * @param {boolean} props.showWinnerHighlight - Whether to highlight the winner(s)
 * @param {boolean} props.showPosition - Whether to show position numbers
 * @param {string} props.className - Additional CSS classes
 */
function PointsTable({
  players,
  currentHole = 1,
  showWinnerHighlight = false,
  showPosition = false,
  className = ''
}) {
  /**
   * Calculate sorted players with ranking and "Thru" values
   */
  const sortedPlayersWithStats = useMemo(() => {
    const sorted = [...players]
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

    // Add position, handling ties
    let currentPosition = 1;
    return sorted.map((player, index) => {
      if (index > 0 && player.points < sorted[index - 1].points) {
        currentPosition = index + 1;
      }
      return { ...player, position: currentPosition };
    });
  }, [players, currentHole]);

  /**
   * Determine if a player is in the lead
   */
  const isLeader = useMemo(() => {
    if (sortedPlayersWithStats.length === 0) {
      return () => false;
    }
    const highestPoints = sortedPlayersWithStats[0].points;
    // Only highlight if they have points and are ahead (or tied for lead)
    return (player) => player.points === highestPoints && player.points > 0;
  }, [sortedPlayersWithStats]);

  /**
   * Determine if a player should be highlighted as winner (final results)
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
  const getRowClass = (player, index) => {
    const classes = ['points-table-row'];
    if (isWinner(player)) {
      classes.push('winner-row');
    } else if (isLeader(player)) {
      classes.push('leader-row');
    }
    return classes.join(' ');
  };

  return (
    <div className={`points-table-container ${className}`}>
      <div className="points-table">
        {/* Table Header */}
        <div className="points-table-header">
          {showPosition && <span className="header-pos">#</span>}
          <span className="header-player">Player</span>
          <span className="header-points">Pts</span>
          <span className="header-record">W-D-L</span>
        </div>

        {/* Table Rows */}
        {sortedPlayersWithStats.map((player, index) => (
          <div key={player.name} className={getRowClass(player, index)}>
            {showPosition && (
              <span className="cell-pos">
                {isLeader(player) ? (
                  <span className="leader-badge">{player.position}</span>
                ) : (
                  player.position
                )}
              </span>
            )}
            <span className="cell-player">{player.name}</span>
            <span className="cell-points">{player.points}</span>
            <span className="cell-record">
              <span className="record-wins">{player.wins}</span>
              <span className="record-sep">-</span>
              <span className="record-draws">{player.draws}</span>
              <span className="record-sep">-</span>
              <span className="record-losses">{player.losses}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PointsTable;