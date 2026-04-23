#!/usr/bin/env node
// Generate VAPID Keys for Web Push Notifications
// Run: node scripts/generate-vapid-keys.js

import crypto from 'crypto';

function generateVapidKeys() {
  // Generate a new key pair using ECDH (Elliptic Curve Diffie-Hellman)
  const ecdh = crypto.createECDH('prime256v1');
  ecdh.generateKeys();

  // Get public and private keys
  const publicKey = ecdh.getPublicKey('base64');
  const privateKey = ecdh.getPrivateKey('base64');

  console.log('\n========================================');
  console.log('VAPID Keys Generated Successfully!');
  console.log('========================================\n');
  
  console.log('PUBLIC KEY (add to .env as VITE_VAPID_PUBLIC_KEY):');
  console.log('------------------------------------------------');
  console.log(publicKey);
  console.log('');
  
  console.log('PRIVATE KEY (keep secret, use in server-side push):');
  console.log('---------------------------------------------------');
  console.log(privateKey);
  console.log('');
  
  console.log('========================================');
  console.log('Usage:');
  console.log('========================================');
  console.log('1. Add to your .env file:');
  console.log(`   VITE_VAPID_PUBLIC_KEY=${publicKey}`);
  console.log('');
  console.log('2. Store PRIVATE_KEY securely on your server:');
  console.log('   (You will need it to send push notifications)');
  console.log('');
  console.log('3. Generate new keys periodically for security');
  console.log('========================================\n');
}

generateVapidKeys();
