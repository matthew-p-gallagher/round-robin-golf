import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Reusable bottom sheet component that slides up from the bottom of the screen
 * Supports drag-to-dismiss gesture via the handle or sheet body
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the bottom sheet is visible
 * @param {Function} props.onClose - Callback to close the sheet
 * @param {string} [props.title] - Optional title displayed at top of sheet
 * @param {React.ReactNode} props.children - Content to display in the sheet
 */
export default function BottomSheet({ isOpen, onClose, title, children }) {
  const sheetRef = useRef(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const currentY = useRef(0);

  // Threshold for dismissing the sheet (in pixels)
  const DISMISS_THRESHOLD = 100;

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

  // Reset drag state when sheet opens/closes
  useEffect(() => {
    if (!isOpen) {
      setDragOffset(0);
      setIsDragging(false);
    }
  }, [isOpen]);

  /**
   * Handle drag start (touch or mouse)
   * @param {number} clientY - Y coordinate of the touch/mouse
   */
  const handleDragStart = useCallback((clientY) => {
    setIsDragging(true);
    dragStartY.current = clientY;
    currentY.current = clientY;
  }, []);

  /**
   * Handle drag move
   * @param {number} clientY - Y coordinate of the touch/mouse
   */
  const handleDragMove = useCallback((clientY) => {
    if (!isDragging) return;

    currentY.current = clientY;
    const delta = clientY - dragStartY.current;
    // Only allow dragging downward (positive delta)
    setDragOffset(Math.max(0, delta));
  }, [isDragging]);

  /**
   * Handle drag end - decide whether to dismiss or snap back
   */
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);

    if (dragOffset > DISMISS_THRESHOLD) {
      // Dismiss the sheet
      onClose();
    } else {
      // Snap back to original position
      setDragOffset(0);
    }
  }, [isDragging, dragOffset, onClose]);

  // Touch event handlers
  const handleTouchStart = useCallback((e) => {
    handleDragStart(e.touches[0].clientY);
  }, [handleDragStart]);

  const handleTouchMove = useCallback((e) => {
    handleDragMove(e.touches[0].clientY);
  }, [handleDragMove]);

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    handleDragStart(e.clientY);
  }, [handleDragStart]);

  // Global mouse move/up handlers for mouse drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      handleDragMove(e.clientY);
    };

    const handleMouseUp = () => {
      handleDragEnd();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

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

  // Dynamic styles for drag transform
  const sheetStyle = {
    transform: `translateY(${dragOffset}px)`,
    transition: isDragging ? 'none' : 'transform 0.2s ease-out'
  };

  return (
    <div
      className="bottom-sheet-backdrop"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`bottom-sheet ${isDragging ? 'bottom-sheet-dragging' : ''}`}
        ref={sheetRef}
        tabIndex={-1}
        style={sheetStyle}
      >
        <div
          className="bottom-sheet-handle-container"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          role="button"
          tabIndex={0}
          aria-label="Drag to dismiss"
        >
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
