import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmailInput from './EmailInput.jsx';

describe('EmailInput Component', () => {
  const defaultProps = {
    id: 'test-email',
    label: 'Email Address',
    value: '',
    onChange: vi.fn()
  };

  it('renders with label and input field', () => {
    render(<EmailInput {...defaultProps} />);

    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Email Address')).toHaveAttribute('id', 'test-email');
  });

  it('displays the current value', () => {
    render(<EmailInput {...defaultProps} value="test@example.com" />);

    expect(screen.getByLabelText('Email Address')).toHaveValue('test@example.com');
  });

  it('calls onChange when input value changes', () => {
    const mockOnChange = vi.fn();
    render(<EmailInput {...defaultProps} onChange={mockOnChange} />);

    const input = screen.getByLabelText('Email Address');
    fireEvent.change(input, { target: { value: 'user@test.com' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('applies placeholder text', () => {
    render(<EmailInput {...defaultProps} placeholder="Enter your email" />);

    expect(screen.getByLabelText('Email Address')).toHaveAttribute('placeholder', 'Enter your email');
  });

  it('applies disabled state', () => {
    render(<EmailInput {...defaultProps} disabled={true} />);

    expect(screen.getByLabelText('Email Address')).toBeDisabled();
  });

  it('applies required attribute', () => {
    render(<EmailInput {...defaultProps} required={true} />);

    expect(screen.getByLabelText('Email Address')).toBeRequired();
  });

  it('applies autoFocus attribute', () => {
    render(<EmailInput {...defaultProps} autoFocus={true} />);

    expect(screen.getByLabelText('Email Address')).toHaveFocus();
  });

  it('has autocomplete email attribute', () => {
    render(<EmailInput {...defaultProps} />);

    expect(screen.getByLabelText('Email Address')).toHaveAttribute('autocomplete', 'email');
  });

  it('renders with form-group and form-label classes', () => {
    const { container } = render(<EmailInput {...defaultProps} />);

    expect(container.querySelector('.form-group')).toBeInTheDocument();
    expect(container.querySelector('.form-label')).toBeInTheDocument();
  });

  it('associates label with input via htmlFor and id', () => {
    render(<EmailInput {...defaultProps} id="email-field" />);

    const label = screen.getByText('Email Address');
    const input = screen.getByLabelText('Email Address');

    expect(label).toHaveAttribute('for', 'email-field');
    expect(input).toHaveAttribute('id', 'email-field');
  });
});
