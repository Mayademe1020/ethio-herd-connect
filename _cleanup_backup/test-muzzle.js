// Simple test to verify MuzzleMLService methods exist
const { muzzleMLService } = require('./src/services/muzzleMLService');

async function test() {
  console.log('Testing MuzzleMLService...');
  
  // Test initialize
  console.log('Calling initialize()...');
  await muzzleMLService.initialize();
  console.log('✓ initialize() works');
  
  // Test loadModel
  console.log('Calling loadModel()...');
  await muzzleMLService.loadModel();
  console.log('✓ loadModel() works');
  
  // Test getStatus
  console.log('Calling getStatus()...');
  const status = muzzleMLService.getStatus();
  console.log('✓ getStatus() works:', status);
  
  console.log('Basic tests passed!');
}

test().catch(console.error);