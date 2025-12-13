import { useEffect, useRef } from 'react';

/**
 * Reusable bottom sheet component that slides up from the bottom of the screen
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the bottom sheet is visible
 * @param {Function} props.onClose - Callback to close the sheet
 * @param {string} [props.title] - Optional title displayed at top of sheet
 * @param {React.ReactNode} props.children - Content to display in the sheet
 */
export default function BottomSheet({ isOpen, onClose, title, children }) {
  const sheetRef = useRef(null);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when sheet is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Focus trap and initial focus
  useEffect(() => {
    if (isOpen && sheetRef.current) {
      sheetRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  /**
   * Handle backdrop click to close
   * @param {React.MouseEvent} e - Click event
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="bottom-sheet-backdrop"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bottom-sheet"
        ref={sheetRef}
        tabIndex={-1}
      >
        <div className="bottom-sheet-handle-container">
          <div className="bottom-sheet-handle" aria-hidden="true" />
        </div>

        {title && (
          <div className="bottom-sheet-header">
            <h2 className="bottom-sheet-title">{title}</h2>
          </div>
        )}

        <div className="bottom-sheet-content">
          {children}
        </div>
      </div>
    </div>
  );
}
