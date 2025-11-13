import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditProfileModal } from '@/components/EditProfileModal';
import { LanguageProvider } from '@/contexts/LanguageContext';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      {component}
    </LanguageProvider>
  );
};

describe('EditProfileModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when open', () => {
    renderWithProviders(
      <EditProfileModal
        isOpen={true}
        onClose={mockOnClose}
        currentFarmerName="Abebe Tesema"
        currentFarmName="Green Valley Farm"
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText(/መገለጫን ያርትዑ|Edit Profile/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ስም እና የአባት ስም|First name and father/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/የእርሻ ስም|Farm name/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderWithProviders(
      <EditProfileModal
        isOpen={false}
        onClose={mockOnClose}
        currentFarmerName="Abebe Tesema"
        currentFarmName="Green Valley Farm"
        onSave={mockOnSave}
      />
    );

    expect(screen.queryByText(/መገለጫን ያርትዑ|Edit Profile/i)).not.toBeInTheDocument();
  });

  it('pre-fills current values', () => {
    renderWithProviders(
      <EditProfileModal
        isOpen={true}
        onClose={mockOnClose}
        currentFarmerName="Abebe Tesema"
        currentFarmName="Green Valley Farm"
        onSave={mockOnSave}
      />
    );

    const farmerNameInput = screen.getByPlaceholderText(/ስም እና የአባት ስም|First name and father/i) as HTMLInputElement;
    const farmNameInput = screen.getByPlaceholderText(/የእርሻ ስም|Farm name/i) as HTMLInputElement;

    expect(farmerNameInput.value).toBe('Abebe Tesema');
    expect(farmNameInput.value).toBe('Green Valley Farm');
  });

  it('handles null farm name', () => {
    renderWithProviders(
      <EditProfileModal
        isOpen={true}
        onClose={mockOnClose}
        currentFarmerName="Abebe Tesema"
        currentFarmName={null}
        onSave={mockOnSave}
      />
    );

    const farmNameInput = screen.getByPlaceholderText(/የእርሻ ስም|Farm name/i) as HTMLInputElement;
    expect(farmNameInput.value).toBe('');
  });

  it('validates farmer name on save', async () => {
    renderWithProviders(
      <EditProfileModal
        isOpen={true}
        onClose={mockOnClose}
        currentFarmerName="Abebe Tesema"
        currentFarmName="Green Valley Farm"
        onSave={mockOnSave}
      />
    );

    const farmerNameInput = screen.getByPlaceholderText(/ስም እና የአባት ስም|First name and father/i);
    const saveButton = screen.getByRole('button', { name: /አስቀምጥ|Save/i });

    // Clear farmer name to single word
    fireEvent.change(farmerNameInput, { target: { value: 'Abebe' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Please enter your full name|እባክዎ ሙሉ ስምዎን ያስገቡ/i)).toBeInTheDocument();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('validates empty farmer name', async () => {
    renderWithProviders(
      <EditProfileModal
        isOpen={true}
        onClose={mockOnClose}
        currentFarmerName="Abebe Tesema"
        currentFarmName="Green Valley Farm"
        onSave={mockOnSave}
      />
    );

    const farmerNameInput = screen.getByPlaceholderText(/ስም እና የአባት ስም|First name and father/i);
    const saveButton = screen.getByRole('button', { name: /አስቀምጥ|Save/i });

    // Clear farmer name
    fireEvent.change(farmerNameInput, { target: { value: '' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Name is required|ስም ያስፈልጋል/i)).toBeInTheDocument();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('calls onSave with valid data', async () => {
    mockOnSave.mockResolvedValue(undefined);

    renderWithProviders(
      <EditProfileModal
        isOpen={true}
        onClose={mockOnClose}
        currentFarmerName="Abebe Tesema"
        currentFarmName="Green Valley Farm"
        onSave={mockOnSave}
      />
    );

    const farmerNameInput = screen.getByPlaceholderText(/ስም እና የአባት ስም|First name and father/i);
    const farmNameInput = screen.getByPlaceholderText(/የእርሻ ስም|Farm name/i);
    const saveButton = screen.getByRole('button', { name: /አስቀምጥ|Save/i });

    fireEvent.change(farmerNameInput, { target: { value: 'Kebede Alemu' } });
    fireEvent.change(farmNameInput, { target: { value: 'Sunshine Farm' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('Kebede Alemu', 'Sunshine Farm');
    });
  });

  it('trims whitespace from inputs', async () => {
    mockOnSave.mockResolvedValue(undefined);

    renderWithProviders(
      <EditProfileModal
        isOpen={true}
        onClose={mockOnClose}
        currentFarmerName="Abebe Tesema"
        currentFarmName="Green Valley Farm"
        onSave={mockOnSave}
      />
    );

    const farmerNameInput = screen.getByPlaceholderText(/ስም እና የአባት ስም|First name and father/i);
    const farmNameInput = screen.getByPlaceholderText(/የእርሻ ስም|Farm name/i);
    const saveButton = screen.getByRole('button', { name: /አስቀምጥ|Save/i });

    fireEvent.change(farmerNameInput, { target: { value: '  Kebede Alemu  ' } });
    fireEvent.change(farmNameInput, { target: { value: '  Sunshine Farm  ' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('Kebede Alemu', 'Sunshine Farm');
    });
  });

  it('shows loading state during save', async () => {
    mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderWithProviders(
      <EditProfileModal
        isOpen={true}
        onClose={mockOnClose}
        currentFarmerName="Abebe Tesema"
        currentFarmName="Green Valley Farm"
        onSave={mockOnSave}
      />
    );

    const saveButton = screen.getByRole('button', { name: /አስቀምጥ|Save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/በማስቀመጥ ላይ|Saving/i)).toBeInTheDocument();
    });

    // Inputs should be disabled during save
    const farmerNameInput = screen.getByPlaceholderText(/ስም እና የአባት ስም|First name and father/i) as HTMLInputElement;
    expect(farmerNameInput.disabled).toBe(true);
  });

  it('disables cancel button during save', async () => {
    mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderWithProviders(
      <EditProfileModal
        isOpen={true}
        onClose={mockOnClose}
        currentFarmerName="Abebe Tesema"
        currentFarmName="Green Valley Farm"
        onSave={mockOnSave}
      />
    );

    const saveButton = screen.getByRole('button', { name: /አስቀምጥ|Save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      const cancelButton = screen.getByRole('button', { name: /ሰርዝ|Cancel/i }) as HTMLButtonElement;
      expect(cancelButton.disabled).toBe(true);
    });
  });

  it('calls onClose when cancel is clicked', () => {
    renderWithProviders(
      <EditProfileModal
        isOpen={true}
        onClose={mockOnClose}
        currentFarmerName="Abebe Tesema"
        currentFarmName="Green Valley Farm"
        onSave={mockOnSave}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /ሰርዝ|Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('clears error when user starts typing', async () => {
    renderWithProviders(
      <EditProfileModal
        isOpen={true}
        onClose={mockOnClose}
        currentFarmerName="Abebe Tesema"
        currentFarmName="Green Valley Farm"
        onSave={mockOnSave}
      />
    );

    const farmerNameInput = screen.getByPlaceholderText(/ስም እና የአባት ስም|First name and father/i);
    const saveButton = screen.getByRole('button', { name: /አስቀምጥ|Save/i });

    // Trigger validation error
    fireEvent.change(farmerNameInput, { target: { value: 'Abebe' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Please enter your full name|እባክዎ ሙሉ ስምዎን ያስገቡ/i)).toBeInTheDocument();
    });

    // Start typing - error should clear
    fireEvent.change(farmerNameInput, { target: { value: 'Abebe T' } });

    await waitFor(() => {
      expect(screen.queryByText(/Please enter your full name|እባክዎ ሙሉ ስምዎን ያስገቡ/i)).not.toBeInTheDocument();
    });
  });

  it('allows empty farm name', async () => {
    mockOnSave.mockResolvedValue(undefined);

    renderWithProviders(
      <EditProfileModal
        isOpen={true}
        onClose={mockOnClose}
        currentFarmerName="Abebe Tesema"
        currentFarmName="Green Valley Farm"
        onSave={mockOnSave}
      />
    );

    const farmNameInput = screen.getByPlaceholderText(/የእርሻ ስም|Farm name/i);
    const saveButton = screen.getByRole('button', { name: /አስቀምጥ|Save/i });

    // Clear farm name
    fireEvent.change(farmNameInput, { target: { value: '' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('Abebe Tesema', '');
    });
  });

  it('resets form when modal reopens', async () => {
    const { rerender } = renderWithProviders(
      <EditProfileModal
        isOpen={true}
        onClose={mockOnClose}
        currentFarmerName="Abebe Tesema"
        currentFarmName="Green Valley Farm"
        onSave={mockOnSave}
      />
    );

    const farmerNameInput = screen.getByPlaceholderText(/ስም እና የአባት ስም|First name and father/i);
    
    // Change the value
    fireEvent.change(farmerNameInput, { target: { value: 'Changed Name' } });
    expect((farmerNameInput as HTMLInputElement).value).toBe('Changed Name');

    // Close modal
    rerender(
      <LanguageProvider>
        <EditProfileModal
          isOpen={false}
          onClose={mockOnClose}
          currentFarmerName="Abebe Tesema"
          currentFarmName="Green Valley Farm"
          onSave={mockOnSave}
        />
      </LanguageProvider>
    );

    // Reopen modal
    rerender(
      <LanguageProvider>
        <EditProfileModal
          isOpen={true}
          onClose={mockOnClose}
          currentFarmerName="Abebe Tesema"
          currentFarmName="Green Valley Farm"
          onSave={mockOnSave}
        />
      </LanguageProvider>
    );

    // Value should be reset
    const resetInput = screen.getByPlaceholderText(/ስም እና የአባት ስም|First name and father/i) as HTMLInputElement;
    expect(resetInput.value).toBe('Abebe Tesema');
  });
});
