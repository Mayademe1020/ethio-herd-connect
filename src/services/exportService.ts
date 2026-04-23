// src/services/exportService.ts
// Export Service for EthioHerd Connect
// Allows farmers to export their data to CSV

import { AnimalData } from '@/types';

export interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
}

class ExportService {
  exportAnimalsToCSV(animals: AnimalData[], options: ExportOptions = {}): void {
    const { filename = 'animals', includeHeaders = true } = options;

    const headers = [
      'ID',
      'Name',
      'Type',
      'Breed',
      'Age (years)',
      'Weight (kg)',
      'Gender',
      'Status',
      'Registration Date',
      'Photo URL'
    ];

    const rows = animals.map(animal => [
      animal.animal_id || animal.id,
      animal.name,
      animal.type,
      animal.breed || animal.subtype || '',
      animal.age?.toString() || '',
      animal.weight?.toString() || '',
      animal.gender || '',
      animal.status || '',
      animal.created_at || '',
      animal.photo_url || ''
    ]);

    this.downloadCSV(headers, rows, filename);
  }

  exportHealthRecordsToCSV(records: any[], options: ExportOptions = {}): void {
    const { filename = 'health_records', includeHeaders = true } = options;

    const headers = [
      'Animal ID',
      'Record Type',
      'Medicine/Treatment',
      'Date',
      'Notes',
      'Veterinarian',
      'Cost'
    ];

    const rows = records.map(record => [
      record.animal_id || '',
      record.record_type || '',
      record.medicine_name || record.treatment || '',
      record.administered_date || record.record_date || '',
      record.notes || '',
      record.vet_name || '',
      record.cost?.toString() || ''
    ]);

    this.downloadCSV(headers, rows, filename);
  }

  exportMilkRecordsToCSV(records: any[], options: ExportOptions = {}): void {
    const { filename = 'milk_records', includeHeaders = true } = options;

    const headers = [
      'Animal ID',
      'Animal Name',
      'Date',
      'Morning (L)',
      'Evening (L)',
      'Total (L)',
      'Notes'
    ];

    const rows = records.map(record => [
      record.animal_id || '',
      record.animal_name || '',
      record.date || record.record_date || '',
      record.morning_amount?.toString() || '',
      record.evening_amount?.toString() || '',
      record.total_amount?.toString() || '',
      record.notes || ''
    ]);

    this.downloadCSV(headers, rows, filename);
  }

  exportMarketListingsToCSV(listings: any[], options: ExportOptions = {}): void {
    const { filename = 'market_listings', includeHeaders = true } = options;

    const headers = [
      'Title',
      'Animal Type',
      'Price (Birr)',
      'Location',
      'Status',
      'Listed Date',
      'Contact Method'
    ];

    const rows = listings.map(listing => [
      listing.title || '',
      listing.animal_type || listing.animal?.type || '',
      listing.price?.toString() || '',
      listing.location || '',
      listing.status || 'active',
      listing.created_at || '',
      listing.contact_method || ''
    ]);

    this.downloadCSV(headers, rows, filename);
  }

  private downloadCSV(headers: string[], rows: string[][], filename: string): void {
    let csvContent = '';

    if (headers.length > 0) {
      csvContent += headers.map(h => this.escapeCSVField(h)).join(',') + '\n';
    }

    rows.forEach(row => {
      csvContent += row.map(field => this.escapeCSVField(field)).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${this.getDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private escapeCSVField(field: string): string {
    if (!field) return '';
    const stringField = String(field);
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  }

  private getDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }
}

export const exportService = new ExportService();
export default exportService;
