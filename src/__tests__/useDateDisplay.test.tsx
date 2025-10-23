import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { useDateDisplay } from '@/hooks/useDateDisplay';
import { ETHIOPIAN_MONTHS } from '@/utils/ethiopianCalendar';

let mockCalendarSystem: 'gregorian' | 'ethiopian' = 'gregorian';
let mockLanguage: 'en' | 'am' | 'or' | 'sw' = 'en';

vi.mock('@/contexts/CalendarContext', () => ({
  useCalendar: () => ({ calendarSystem: mockCalendarSystem })
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ language: mockLanguage })
}));

function ShowFormats({ date }: { date: string }) {
  const { formatDate, formatDateTime } = useDateDisplay();
  const long = formatDate(date, 'long');
  const short = formatDate(date, 'short');
  const dt = formatDateTime(date);
  return <div data-long={long} data-short={short} data-dt={dt} />;
}

describe('useDateDisplay', () => {
  beforeEach(() => {
    mockCalendarSystem = 'gregorian';
    mockLanguage = 'en';
  });

  it('formats Gregorian dates consistently (en)', () => {
    const { container } = render(<ShowFormats date="2023-01-15T00:00:00Z" />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('data-long')).toBe('January 15, 2023');
    expect(el.getAttribute('data-short')).toBe('01/15/2023');
    const dt = el.getAttribute('data-dt') || '';
    expect(dt.startsWith('January 15, 2023')).toBe(true);
    expect(dt.includes(':')).toBe(true); // has time portion
  });

  it('formats Ethiopian dates consistently (en)', () => {
    mockCalendarSystem = 'ethiopian';
    const { container } = render(<ShowFormats date="2023-01-15T00:00:00Z" />);
    const el = container.firstChild as HTMLElement;
    const long = el.getAttribute('data-long') || '';
    const short = el.getAttribute('data-short') || '';

    // Long format contains an Ethiopian month name
    const hasEthMonth = ETHIOPIAN_MONTHS.en.some(m => long.includes(m));
    expect(hasEthMonth).toBe(true);

    // Short format is day/month/year style
    expect(/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(short)).toBe(true);
  });

  it('respects language variants without breaking formatting', () => {
    mockLanguage = 'am';
    const { container } = render(<ShowFormats date="2023-01-15T00:00:00Z" />);
    const el = container.firstChild as HTMLElement;
    // Long format should still be a valid Gregorian long format structure
    const long = el.getAttribute('data-long') || '';
    expect(/\w+ \d{1,2}, \d{4}/.test(long)).toBe(true);
  });
});