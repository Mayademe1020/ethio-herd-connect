// src/__tests__/onboarding.integration.test.tsx - Integration Tests for Onboarding Component

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Onboarding from '@/pages/Onboarding';
import { toast } from 'sonner';
import type { ReactNode } from 'react';

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

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: vi.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

// Create a mock for useAuth
const mockUseAuth = vi.fn();

// Mock AuthContext
vi.mock('@/contexts/AuthContextMVP', () => ({
  useAuth: () => mockUseAuth(),
}));

// Helper to render component with auth context
const renderWithAuth = (user: any = null) => {
  mockUseAuth.mockReturnValue({
    user,
    loading: false,
    session: null,
    signOut: vi.fn(),
  });

  return render(
    <BrowserRouter>
      <Onboarding />
    </BrowserRouter>
  );
};

describe('Onboarding Component Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render onboarding form with all required fields', () => {
      const mockUser = { id: '123', email: '911234567@ethioherd.app' };
      renderWithAuth(mockUser);

      // Check for bilingual headers
      expect(screen.getByText(/እንኳን ደህና መጡ!/i)).toBeInTheDocument();
      expect(screen.getByText(/Welcome to Ethio Herd Connect/i)).toBeInTheDocument();

      // Check for name input
      expect(screen.getByPlaceholderText(/ለምሳሌ: አበበ ተሰማ/i)).toBeInTheDocument();

      // Check for farm name input
      expect(screen.getByPlaceholderText(/ለምሳሌ: የአበበ እርሻ/i)).toBeInTheDocument();

      // Check for submit button
      expect(screen.getByRole('button', { name: /ቀጥል \/ Continue/i })).toBeInTheDocument();
    });

    it('should have auto-correct disabled on name input', () => {
      const mockUser = { id: '123', email: '911234567@ethioherd.app' };
      renderWithAuth(mockUser);

      const nameInput = screen.getByPlaceholderText(/ለምሳሌ: አበበ ተሰማ/i);
      
      expect(nameInput).toHaveAttribute('autoComplete', 'off');
      expect(nameInput).toHaveAttribute('autoCorrect', 'off');
      expect(nameInput).toHaveAttribute('spellCheck', 'false');
      expect(nameInput).toHaveAttribute('data-form-type', 'other');
    });

    it('should have auto-correct disabled on farm name input', () => {
      const mockUser = { id: '123', email: '911234567@ethioherd.app' };
      renderWithAuth(mockUser);

      const farmNameInput = screen.getByPlaceholderText(/ለምሳሌ: የአበበ እርሻ/i);
      
      expect(farmNameInput).toHaveAttribute('autoComplete', 'off');
      expect(farmNameInput).toHaveAttribute('autoCorrect', 'off');
      expect(farmNameInput).toHaveAttribute('spellCheck', 'false');
      expect(farmNameInput).toHaveAttribute('data-form-type', 'other');
    });

    it('should disable submit button when name is empty', () => {
      const mockUser = { id: '123', email: '911234567@ethioherd.app' };
      renderWithAuth(mockUser);

      const submitButton = screen.getByRole('button', { name: /ቀጥል \/ Continue/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Name Validation - Real-time', () => {
    it('should not show error initially', () => {
      const mockUser = { id: '123', email: '911234567@ethioherd.app' };
      renderWithAuth(mockUser);

      const errorMessage = screen.queryByText(/Please enter your full name/i);
      expect(errorMessage).not.toBeInTheDocument();
    });

    it('should show error when single word is entered and field is blurred', async () => {
      const mockUser = { id: '123', email: '911234567@ethioherd.app' };
      renderWithAuth(mockUser);

      const nameInput = screen.getByPlaceholderText(/ለምሳሌ: አበበ ተሰማ/i);
      
      // Enter single word
      fireEvent.change(nameInput, { target: { value: 'Abebe' } });
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(screen.getByText(/Please enter your full name \(first name and father's name\)/i)).toBeInTheDocument();
      });
    });

    it('should clear error when valid full name is entered', async () => {
      const mockUser = { id: '123', email: '911234567@ethioherd.app' };
      renderWithAuth(mockUser);

      const nameInput = screen.getByPlaceholderText(/ለምሳሌ: አበበ ተሰማ/i);
      
      // Enter single word and blur to trigger error
      fireEvent.change(nameInput, { target: { value: 'Abebe' } });
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(screen.getByText(/Please enter your full name/i)).toBeInTheDocument();
      });

      // Now enter valid full name
      fireEvent.change(nameInput, { target: { value: 'Abebe Tesema' } });

      await waitFor(() => {
        expect(screen.queryByText(/Please enter your full name/i)).not.toBeInTheDocument();
      });
    });

    it('should validate Amharic names correctly', async () => {
      const mockUser = { id: '123', email: '911234567@ethioherd.app' };
      renderWithAuth(mockUser);

      const nameInput = screen.getByPlaceholderText(/ለምሳሌ: አበበ ተሰማ/i);
      
      // Enter valid Amharic name
      fireEvent.change(nameInput, { target: { value: 'አበበ ተሰማ' } });
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(screen.queryByText(/Please enter your full name/i)).not.toBeInTheDocument();
      });
    });

    it('should show error for names with short parts', async () => {
      const mockUser = { id: '123', email: '911234567@ethioherd.app' };
      renderWithAuth(mockUser);

      const nameInput = screen.getByPlaceholderText(/ለምሳሌ: አበበ ተሰማ/i);
      
      // Enter name with short part
      fireEvent.change(nameInput, { target: { value: 'A Tesema' } });
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(screen.getByText(/Each name part must be at least 2 characters/i)).toBeInTheDocument();
      });
    });

    it('should enable submit button when valid name is entered', async () => {
      const mockUser = { id: '123', email: '911234567@ethioherd.app' };
      renderWithAuth(mockUser);

      const nameInput = screen.getByPlaceholderText(/ለምሳሌ: አበበ ተሰማ/i);
      const submitButton = screen.getByRole('button', { name: /ቀጥል \/ Continue/i });

      // Initially disabled
      expect(submitButton).toBeDisabled();

      // Enter valid name
      fireEvent.change(nameInput, { target: { value: 'Abebe Tesema' } });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Name Validation - On Submit', () => {
    it('should prevent submission with invalid name', async () => {
      const mockUser = { id: '123', email: '911234567@ethioherd.app' };
      const { supabase } = await import('@/integrations/supabase/client');
      const mockUpsert = vi.fn(() => Promise.resolve({ error: null }));
      (supabase.from as any).mockReturnValue({ upsert: mockUpsert });

      renderWithAuth(mockUser);

      const nameInput = screen.getByPlaceholderText(/ለምሳሌ: አበበ ተሰማ/i);
      
      // Enter single word (invalid)
      fireEvent.change(nameInput, { target: { value: 'Abebe' } });

      // Try to submit by pressing Enter
      fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        // Should show error toast
        expect(toast.error).toHaveBeenCalled();
        // Should not call upsert
        expect(mockUpsert).not.toHaveBeenCalled();
      });
    });

    it('should show bilingual error toast on validation failure', async () => {
      const mockUser = { id: '123', email: '911234567@ethioherd.app' };
      renderWithAuth(mockUser);

      const nameInput = screen.getByPlaceholderText(/ለምሳሌ: አበበ ተሰማ/i);
      
      // Enter invalid name
      fireEvent.change(nameInput, { target: { value: 'Abebe' } });
      fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('እባክዎ ሙሉ ስምዎን ያስገቡ'),
          expect.objectContaining({
            description: expect.stringContaining('Please enter your full name')
          })
        );
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit successfully with valid data', async () => {
      const mockUser = { id: '123', email: '911234567@ethioherd.app' };
      const { supabase } = await import('@/integrations/supabase/client');
      const mockUpsert = vi.fn(() => Promise.resolve({ error: null }));
      (supabase.from as any).mockReturnValue({ upsert: mockUpsert });

      renderWithAuth(mockUser);

      const nameInput = screen.getByPlaceholderText(/ለምሳሌ: አበበ ተሰማ/i);
      const farmNameInput = screen.getByPlaceholderText(/ለምሳሌ: የአበበ እርሻ/i);

      // Enter valid data
      fireEvent.change(nameInput, { target: { value: 'Abebe Tesema' } });
      fireEvent.change(farmNameInput, { target: { value: 'Abebe Farm' } });

      // Submit
      fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(mockUpsert).toHaveBeenCalledWith({
          id: '123',
          phone: '911234567',
          farmer_name: 'Abebe Tesema',
          farm_name: 'Abebe Farm',
        });
      });
    });

    it('should handle optional farm name correctly', async () => {
      const mockUser = { id: '123', email: '911234567@ethioherd.app' };
      const { supabase } = await import('@/integrations/supabase/client');
      const mockUpsert = vi.fn(() => Promise.resolve({ error: null }));
      (supabase.from as any).mockReturnValue({ upsert: mockUpsert });

      renderWithAuth(mockUser);

      const nameInput = screen.getByPlaceholderText(/ለምሳሌ: አበበ ተሰማ/i);

      // Enter only name, no farm name
      fireEvent.change(nameInput, { target: { value: 'Abebe Tesema' } });
      fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(mockUpsert).toHaveBeenCalledWith({
          id: '123',
          phone: '911234567',
          farmer_name: 'Abebe Tesema',
          farm_name: null,
        });
      });
    });

    it('should show success toast on successful submission', async () => {
      const mockUser = { id: '123', email: '911234567@ethioherd.app' };
      const { supabase } = await import('@/integrations/supabase/client');
      const mockUpsert = vi.fn(() => Promise.resolve({ error: null }));
      (supabase.from as any).mockReturnValue({ upsert: mockUpsert });

      renderWithAuth(mockUser);

      const nameInput = screen.getByPlaceholderText(/ለምሳሌ: አበበ ተሰማ/i);
      fireEvent.change(nameInput, { target: { value: 'Abebe Tesema' } });
      fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          '✓ እንኳን ደህና መጡ! / Welcome!',
          expect.objectContaining({
            description: 'Abebe Tesema'
          })
        );
      });
    });

    it('should trim whitespace from inputs', async () => {
      const mockUser = { id: '123', email: '911234567@ethioherd.app' };
      const { supabase } = await import('@/integrations/supabase/client');
      const mockUpsert = vi.fn(() => Promise.resolve({ error: null }));
      (supabase.from as any).mockReturnValue({ upsert: mockUpsert });

      renderWithAuth(mockUser);

      const nameInput = screen.getByPlaceholderText(/ለምሳሌ: አበበ ተሰማ/i);
      const farmNameInput = screen.getByPlaceholderText(/ለምሳሌ: የአበበ እርሻ/i);

      // Enter data with extra whitespace
      fireEvent.change(nameInput, { target: { value: '  Abebe Tesema  ' } });
      fireEvent.change(farmNameInput, { target: { value: '  Abebe Farm  ' } });
      fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(mockUpsert).toHaveBeenCalledWith({
          id: '123',
          phone: '911234567',
          farmer_name: 'Abebe Tesema',
          farm_name: 'Abebe Farm',
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const mockUser = { id: '123', email: '911234567@ethioherd.app' };
      const { supabase } = await import('@/integrations/supabase/client');
      const mockUpsert = vi.fn(() => Promise.resolve({ 
        error: { message: 'Database connection failed' } 
      }));
      (supabase.from as any).mockReturnValue({ upsert: mockUpsert });

      renderWithAuth(mockUser);

      const nameInput = screen.getByPlaceholderText(/ለምሳሌ: አበበ ተሰማ/i);
      fireEvent.change(nameInput, { target: { value: 'Abebe Tesema' } });
      fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'መረጃ ማስቀመጥ አልተቻለም / Failed to save',
          expect.objectContaining({
            description: 'Database connection failed'
          })
        );
      });
    });

    it('should detect network errors specifically', async () => {
      const mockUser = { id: '123', email: '911234567@ethioherd.app' };
      const { supabase } = await import('@/integrations/supabase/client');
      const mockUpsert = vi.fn(() => Promise.reject(new Error('Failed to fetch')));
      (supabase.from as any).mockReturnValue({ upsert: mockUpsert });

      renderWithAuth(mockUser);

      const nameInput = screen.getByPlaceholderText(/ለምሳሌ: አበበ ተሰማ/i);
      fireEvent.change(nameInput, { target: { value: 'Abebe Tesema' } });
      fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'የኢንተርኔት ግንኙነት ችግር / Network Error',
          expect.objectContaining({
            description: 'እባክዎ ግንኙነትዎን ያረጋግጡ / Please check your connection',
            action: expect.objectContaining({
              label: 'እንደገና ይሞክሩ / Retry'
            })
          })
        );
      });
    });

    it('should provide retry functionality for network errors', async () => {
      const mockUser = { id: '123', email: '911234567@ethioherd.app' };
      const { supabase } = await import('@/integrations/supabase/client');
      
      // First call fails, second succeeds
      let callCount = 0;
      const mockUpsert = vi.fn(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('network error'));
        }
        return Promise.resolve({ error: null });
      });
      (supabase.from as any).mockReturnValue({ upsert: mockUpsert });

      renderWithAuth(mockUser);

      const nameInput = screen.getByPlaceholderText(/ለምሳሌ: አበበ ተሰማ/i);
      fireEvent.change(nameInput, { target: { value: 'Abebe Tesema' } });
      fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      // Verify retry action was provided
      const errorCall = (toast.error as any).mock.calls[0];
      expect(errorCall[1]).toHaveProperty('action');
      expect(errorCall[1].action).toHaveProperty('onClick');
    });

    it('should show bilingual error messages', async () => {
      const mockUser = { id: '123', email: '911234567@ethioherd.app' };
      const { supabase } = await import('@/integrations/supabase/client');
      const mockUpsert = vi.fn(() => Promise.resolve({ 
        error: { message: 'Test error' } 
      }));
      (supabase.from as any).mockReturnValue({ upsert: mockUpsert });

      renderWithAuth(mockUser);

      const nameInput = screen.getByPlaceholderText(/ለምሳሌ: አበበ ተሰማ/i);
      fireEvent.change(nameInput, { target: { value: 'Abebe Tesema' } });
      fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        const errorCall = (toast.error as any).mock.calls[0];
        // Check for Amharic in main message
        expect(errorCall[0]).toMatch(/መረጃ ማስቀመጥ አልተቻለም/);
        // Check for English in main message
        expect(errorCall[0]).toMatch(/Failed to save/);
      });
    });

    it('should handle missing user gracefully', async () => {
      renderWithAuth(null); // No user

      const nameInput = screen.getByPlaceholderText(/ለምሳሌ: አበበ ተሰማ/i);
      fireEvent.change(nameInput, { target: { value: 'Abebe Tesema' } });
      fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('User not authenticated');
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during submission', async () => {
      const mockUser = { id: '123', email: '911234567@ethioherd.app' };
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Create a promise that we can control
      let resolveUpsert: any;
      const upsertPromise = new Promise((resolve) => {
        resolveUpsert = resolve;
      });
      const mockUpsert = vi.fn(() => upsertPromise);
      (supabase.from as any).mockReturnValue({ upsert: mockUpsert });

      renderWithAuth(mockUser);

      const nameInput = screen.getByPlaceholderText(/ለምሳሌ: አበበ ተሰማ/i);
      fireEvent.change(nameInput, { target: { value: 'Abebe Tesema' } });
      
      const submitButton = screen.getByRole('button', { name: /ቀጥል \/ Continue/i });
      fireEvent.click(submitButton);

      // Should show loading text
      await waitFor(() => {
        expect(screen.getByText(/እባክዎ ይጠብቁ\.\.\. \/ Please wait\.\.\./i)).toBeInTheDocument();
      });

      // Resolve the promise
      resolveUpsert({ error: null });

      await waitFor(() => {
        expect(screen.queryByText(/እባክዎ ይጠብቁ\.\.\./i)).not.toBeInTheDocument();
      });
    });

    it('should disable submit button during loading', async () => {
      const mockUser = { id: '123', email: '911234567@ethioherd.app' };
      const { supabase } = await import('@/integrations/supabase/client');
      
      let resolveUpsert: any;
      const upsertPromise = new Promise((resolve) => {
        resolveUpsert = resolve;
      });
      const mockUpsert = vi.fn(() => upsertPromise);
      (supabase.from as any).mockReturnValue({ upsert: mockUpsert });

      renderWithAuth(mockUser);

      const nameInput = screen.getByPlaceholderText(/ለምሳሌ: አበበ ተሰማ/i);
      fireEvent.change(nameInput, { target: { value: 'Abebe Tesema' } });
      
      const submitButton = screen.getByRole('button', { name: /ቀጥል \/ Continue/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      resolveUpsert({ error: null });
    });
  });

  describe('Phone Number Extraction', () => {
    it('should extract phone from email correctly', async () => {
      const mockUser = { id: '123', email: '922345678@ethioherd.app' };
      const { supabase } = await import('@/integrations/supabase/client');
      const mockUpsert = vi.fn(() => Promise.resolve({ error: null }));
      (supabase.from as any).mockReturnValue({ upsert: mockUpsert });

      renderWithAuth(mockUser);

      const nameInput = screen.getByPlaceholderText(/ለምሳሌ: አበበ ተሰማ/i);
      fireEvent.change(nameInput, { target: { value: 'Abebe Tesema' } });
      fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(mockUpsert).toHaveBeenCalledWith(
          expect.objectContaining({
            phone: '922345678'
          })
        );
      });
    });

    it('should handle missing email gracefully', async () => {
      const mockUser = { id: '123', email: undefined };
      const { supabase } = await import('@/integrations/supabase/client');
      const mockUpsert = vi.fn(() => Promise.resolve({ error: null }));
      (supabase.from as any).mockReturnValue({ upsert: mockUpsert });

      renderWithAuth(mockUser);

      const nameInput = screen.getByPlaceholderText(/ለምሳሌ: አበበ ተሰማ/i);
      fireEvent.change(nameInput, { target: { value: 'Abebe Tesema' } });
      fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(mockUpsert).toHaveBeenCalledWith(
          expect.objectContaining({
            phone: ''
          })
        );
      });
    });
  });
});
