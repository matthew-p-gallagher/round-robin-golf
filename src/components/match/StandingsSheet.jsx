import BottomSheet from '../common/BottomSheet.jsx';
import PointsTable from '../PointsTable.jsx';

/**
 * Bottom sheet displaying current standings
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the sheet is visible
 * @param {Player[]} props.players - Array of players for stats display
 * @param {number} props.currentHole - Current hole number
 * @param {Function} props.onClose - Callback to close the sheet
 */
export default function StandingsSheet({ isOpen, players, currentHole, onClose }) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Current Standings"
    >
      <PointsTable
        players={players}
        currentHole={currentHole}
        showWinnerHighlight={false}
        showPosition={true}
      />
    </BottomSheet>
  );
}
