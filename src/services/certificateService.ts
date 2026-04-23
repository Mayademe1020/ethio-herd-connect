// src/services/certificateService.ts
// Generate PDF health certificates

import { jsPDF } from 'jspdf';
import { getHealthRecordsByAnimal } from './healthRecordService';
import { calculateNextDueDate } from './vaccinePresetService';

export async function generateHealthCertificate(
  animalId: string, 
  animalName: string, 
  ownerName: string,
  animalType?: string
): Promise<void> {
  const doc = new jsPDF();
  
  // Colors
  const primaryColor = [59, 130, 246]; // Blue
  const textColor = [31, 41, 55]; // Dark gray
  
  // Header Background
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Health Certificate', 105, 25, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Ethio Herd Connect', 105, 32, { align: 'center' });
  
  // Animal Information Section
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Animal Information', 20, 55);
  
  // Line under section
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 58, 190, 58);
  
  // Animal details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const details = [
    ['Animal ID:', animalId],
    ['Name:', animalName],
    ['Type:', animalType || 'Livestock'],
    ['Owner:', ownerName],
    ['Date Issued:', new Date().toLocaleDateString('en-GB')],
  ];
  
  let yPos = 68;
  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 60, yPos);
    yPos += 8;
  });
  
  // Get health records
  const records = await getHealthRecordsByAnimal(animalId);
  const vaccinations = records.filter(r => r.record_type === 'vaccination');
  const illnesses = records.filter(r => r.record_type === 'illness');
  
  // Vaccination History Section
  yPos += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Vaccination History (${vaccinations.length} records)`, 20, yPos);
  doc.line(20, yPos + 3, 190, yPos + 3);
  
  yPos += 12;
  
  if (vaccinations.length > 0) {
    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPos - 6, 170, 10, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Vaccine', 25, yPos);
    doc.text('Date Given', 85, yPos);
    doc.text('Next Due', 130, yPos);
    doc.text('Status', 170, yPos);
    
    yPos += 10;
    
    // Vaccination records
    doc.setFont('helvetica', 'normal');
    vaccinations.slice(0, 10).forEach((vacc) => {
      const nextDue = calculateNextDueDate(vacc.medicine_name || '', vacc.administered_date);
      const nextDueDate = new Date(nextDue);
      const today = new Date();
      const isOverdue = nextDueDate < today;
      const daysUntil = Math.ceil((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      doc.text(vacc.medicine_name || 'Unknown', 25, yPos);
      doc.text(vacc.administered_date, 85, yPos);
      doc.text(nextDue, 130, yPos);
      
      if (isOverdue) {
        doc.setTextColor(220, 38, 38); // Red
        doc.text('Overdue', 170, yPos);
      } else if (daysUntil <= 30) {
        doc.setTextColor(234, 179, 8); // Yellow
        doc.text('Due Soon', 170, yPos);
      } else {
        doc.setTextColor(34, 197, 94); // Green
        doc.text('Valid', 170, yPos);
      }
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      
      yPos += 8;
    });
    
    if (vaccinations.length > 10) {
      yPos += 5;
      doc.setFontSize(9);
      doc.setTextColor(128, 128, 128);
      doc.text(`... and ${vaccinations.length - 10} more vaccinations`, 25, yPos);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    }
  } else {
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text('No vaccination records found.', 25, yPos);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  }
  
  // Health Summary Section
  yPos += 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Health Summary', 20, yPos);
  doc.line(20, yPos + 3, 190, yPos + 3);
  
  yPos += 12;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const summary = [
    ['Total Vaccinations:', vaccinations.length.toString()],
    ['Illness Records:', illnesses.length.toString()],
    ['Last Activity:', records[0]?.administered_date || 'N/A'],
  ];
  
  summary.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 25, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 80, yPos);
    yPos += 8;
  });
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  doc.text('This certificate verifies the vaccination history recorded in the Ethio Herd Connect system.', 105, pageHeight - 20, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleString('en-GB')} | ethioherd.com`, 105, pageHeight - 15, { align: 'center' });
  
  // Save
  doc.save(`health-certificate-${animalId}.pdf`);
}

export default {
  generateHealthCertificate
};
