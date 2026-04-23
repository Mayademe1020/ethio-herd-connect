// Test to verify MuzzleMLService methods exist and work
import { muzzleMLService } from './src/services/muzzleMLService.js';

async function testMuzzleMLService() {
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
  
  // Test qualityCheck with mock image data
  console.log('Testing qualityCheck()...');
  const mockImageData = new ImageData(new Uint8ClampedArray([255, 255, 255, 255].fill(0, 0, 224*224*4)), 224, 224);
  const quality = muzzleMLService.qualityCheck(mockImageData);
  console.log('✓ qualityCheck() works:', quality);
  
  console.log('All tests passed!');
}

testMuzzleMLService().catch(console.error);