import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LogoutConfirmDialog } from '../components/LogoutConfirmDialog';
import { LanguageProvider } from '../contexts/LanguageContext';

// Mock component wrapper with LanguageProvider
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <LanguageProvider>
      {ui}
    </LanguageProvider>
  );
};

describe('LogoutConfirmDialog', () => {
  it('renders when isOpen is true', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderWithProviders(
      <LogoutConfirmDialog
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    // Check for dialog title (in Amharic by default)
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderWithProviders(
      <LogoutConfirmDialog
        isOpen={false}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    // Dialog should not be visible
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('calls onConfirm when logout button is clicked', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderWithProviders(
      <LogoutConfirmDialog
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    // Find and click the logout button (ውጣ in Amharic)
    const buttons = screen.getAllByRole('button');
    const logoutButton = buttons.find(btn => btn.textContent === 'ውጣ');
    expect(logoutButton).toBeDefined();
    fireEvent.click(logoutButton!);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderWithProviders(
      <LogoutConfirmDialog
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    // Find and click the cancel button (ሰርዝ in Amharic)
    const buttons = screen.getAllByRole('button');
    const cancelButton = buttons.find(btn => btn.textContent === 'ሰርዝ');
    expect(cancelButton).toBeDefined();
    fireEvent.click(cancelButton!);

    // onCancel is called by both the button click and the dialog's onOpenChange
    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('displays bilingual content', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderWithProviders(
      <LogoutConfirmDialog
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    // Check for Amharic text (default language)
    expect(screen.getByText('መውጣት ይፈልጋሉ?')).toBeInTheDocument();
    expect(screen.getByText('መለያዎን ለመድረስ እንደገና መግባት ያስፈልግዎታል')).toBeInTheDocument();
  });

  it('styles logout button as destructive (red)', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderWithProviders(
      <LogoutConfirmDialog
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    // Find the logout button (ውጣ in Amharic)
    const buttons = screen.getAllByRole('button');
    const logoutButton = buttons.find(btn => btn.textContent === 'ውጣ');
    expect(logoutButton).toBeDefined();
    
    // Check for red background classes
    expect(logoutButton!.className).toContain('bg-red-600');
  });
});
