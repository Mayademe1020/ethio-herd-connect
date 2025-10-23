import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CountryProvider, useCountry } from '@/contexts/CountryContext';

let mockMobile: string | undefined = undefined;
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, userProfile: mockMobile ? { mobile_number: mockMobile } : undefined })
}));

function ShowCountry() {
  const { country, setCountry } = useCountry();
  return (
    <div>
      <span data-testid="country">{country}</span>
      <button onClick={() => setCountry('TZ')}>set-tz</button>
    </div>
  );
}

describe('CountryContext', () => {
  beforeEach(() => {
    localStorage.clear();
    mockMobile = undefined;
  });

  it('defaults from user phone when no stored country', () => {
    mockMobile = '+254700123456'; // Kenya
    render(
      <CountryProvider>
        <ShowCountry />
      </CountryProvider>
    );
    expect(screen.getByTestId('country').textContent).toBe('KE');
  });

  it('respects stored manual selection over phone-derived', () => {
    localStorage.setItem('country', 'UG');
    mockMobile = '+254700123456'; // Kenya
    render(
      <CountryProvider>
        <ShowCountry />
      </CountryProvider>
    );
    // Should keep stored value
    expect(screen.getByTestId('country').textContent).toBe('UG');
  });

  it('persists manual changes to localStorage', () => {
    render(
      <CountryProvider>
        <ShowCountry />
      </CountryProvider>
    );
    expect(localStorage.getItem('country')).toBe('ET'); // initial default
    fireEvent.click(screen.getByText('set-tz'));
    expect(localStorage.getItem('country')).toBe('TZ');
    expect(screen.getByTestId('country').textContent).toBe('TZ');
  });
});