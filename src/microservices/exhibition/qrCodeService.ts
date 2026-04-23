/**
 * Microservice: QR Code Service
 * Responsibility: Generate QR codes for exhibition
 * Single File: Generates PNG/SVG files
 */

import * as fs from 'fs';
import * as path from 'path';

interface QRCodeConfig {
  url: string;
  size: number;
  outputPath: string;
  format: 'svg' | 'png';
}

interface QRCodeResult {
  success: boolean;
  filePath: string;
  size: number;
  errors: string[];
}

/**
 * Task 1: Generate QR code using Google Charts API
 * Files affected: exhibition/qr-code.{svg,png}
 * Action: Create QR code image
 */
export async function generateQRCode(config: QRCodeConfig): Promise<QRCodeResult> {
  const errors: string[] = [];
  
  try {
    console.log('📱 Generating QR code...');
    
    // Use Google Charts API to generate QR
    const encodedUrl = encodeURIComponent(config.url);
    const apiUrl = `https://chart.googleapis.com/chart?cht=qr&chs=${config.size}x${config.size}&chl=${encodedUrl}&chld=H|0`;
    
    // Download QR code
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to generate QR: ${response.status}`);
    }
    
    const buffer = Buffer.from(await response.arrayBuffer());
    
    // Ensure directory exists
    const dir = path.dirname(config.outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Save file
    fs.writeFileSync(config.outputPath, buffer);
    
    console.log('✅ QR code generated:', config.outputPath);
    
    return {
      success: true,
      filePath: config.outputPath,
      size: buffer.length,
      errors: []
    };
    
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(message);
    console.error('❌ QR generation failed:', message);
    
    return {
      success: false,
      filePath: '',
      size: 0,
      errors
    };
  }
}

/**
 * Task 2: Create printable poster HTML
 * Files affected: exhibition/poster.html
 * Action: Generate printable poster with QR
 */
export function createPoster(url: string, qrPath: string): string {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ethio Herd Connect - Exhibition Poster</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 40px;
      max-width: 600px;
      margin: 0 auto;
    }
    h1 { color: #2d5a27; margin-bottom: 10px; }
    h2 { color: #666; margin-bottom: 30px; }
    .qr-code { margin: 30px 0; }
    .url { 
      font-size: 18px; 
      color: #2d5a27; 
      word-break: break-all;
      margin: 20px 0;
    }
    .features {
      text-align: left;
      margin: 30px 0;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 10px;
    }
    .features li { margin: 10px 0; }
    @media print {
      body { padding: 20px; }
    }
  </style>
</head>
<body>
  <h1>🐄 Ethio Herd Connect</h1>
  <h2>Digital Livestock Management for Ethiopian Farmers</h2>
  
  <div class="qr-code">
    <img src="${qrPath}" alt="Scan to access app" width="250" height="250">
  </div>
  
  <div class="url">${url}</div>
  
  <div class="features">
    <h3>Try it now:</h3>
    <ul>
      <li>📱 Register your animals (3 clicks)</li>
      <li>🥛 Record daily milk production</li>
      <li>🏪 Sell livestock on marketplace</li>
      <li>💬 Connect with buyers directly</li>
      <li>📴 Works offline in rural areas</li>
      <li>🌐 Available in Amharic & English</li>
    </ul>
  </div>
  
  <p><strong>Scan the QR code or visit the URL to try the app!</strong></p>
</body>
</html>
  `;
  
  const posterPath = 'exhibition/poster.html';
  fs.mkdirSync('exhibition', { recursive: true });
  fs.writeFileSync(posterPath, html);
  
  console.log('✅ Poster created:', posterPath);
  return posterPath;
}

// Single action export
export async function executeQRGeneration(url: string): Promise<QRCodeResult> {
  console.log('🎯 Starting QR code generation...\n');
  
  const qrResult = await generateQRCode({
    url,
    size: 300,
    outputPath: 'exhibition/qr-code.png',
    format: 'png'
  });
  
  if (qrResult.success) {
    createPoster(url, qrResult.filePath);
  }
  
  return qrResult;
}
