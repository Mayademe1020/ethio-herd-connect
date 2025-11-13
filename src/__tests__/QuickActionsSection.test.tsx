// src/__tests__/QuickActionsSection.test.tsx - Tests for QuickActionsSection component

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QuickActionsSection } from '@/components/QuickActionsSection';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'profile.quickActions': 'Quick Actions',
        'profile.registerAnimal': 'Register Animal',
        'profile.recordMilk': 'Record Milk',
        'profile.createListing': 'Create Listing',
        'profile.pleaseRegisterAnimalsFirst': 'Please register animals first',
      };
      return translations[key] || key;
    },
  }),
}));

const renderComponent = (hasAnimals: boolean) => {
  return render(
    <BrowserRouter>
      <QuickActionsSection hasAnimals={hasAnimals} />
    </BrowserRouter>
  );
};

describe('QuickActionsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with title', () => {
    renderComponent(true);
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });

  it('renders all three action buttons', () => {
    renderComponent(true);
    expect(screen.getByText('Register Animal')).toBeInTheDocument();
    expect(screen.getByText('Record Milk')).toBeInTheDocument();
    expect(screen.getByText('Create Listing')).toBeInTheDocument();
  });

  it('shows toast when clicking Record Milk without animals', () => {
    renderComponent(false);
    
    const recordMilkButton = screen.getByText('Record Milk');
    fireEvent.click(recordMilkButton);
    
    expect(toast.error).toHaveBeenCalledWith('Please register animals first');
  });

  it('shows toast when clicking Create Listing without animals', () => {
    renderComponent(false);
    
    const createListingButton = screen.getByText('Create Listing');
    fireEvent.click(createListingButton);
    
    expect(toast.error).toHaveBeenCalledWith('Please register animals first');
  });

  it('does not show toast when clicking Register Animal without animals', () => {
    renderComponent(false);
    
    const registerAnimalButton = screen.getByText('Register Animal');
    fireEvent.click(registerAnimalButton);
    
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('applies correct styling for touch targets', () => {
    renderComponent(true);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      const style = window.getComputedStyle(button);
      // Check that minWidth and minHeight are set (accessibility requirement)
      expect(button).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
    });
  });

  it('has proper accessibility labels', () => {
    renderComponent(true);
    
    expect(screen.getByLabelText('Register Animal')).toBeInTheDocument();
    expect(screen.getByLabelText('Record Milk')).toBeInTheDocument();
    expect(screen.getByLabelText('Create Listing')).toBeInTheDocument();
  });
});
