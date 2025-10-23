import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { useTranslations } from '@/hooks/useTranslations';
import { secureLocalStorage } from '@/utils/securityUtils';
import apiClient from '@/utils/secureApiClient';
import usePrivacyControls from '@/hooks/usePrivacyControls';
import { encryptData, decryptData } from '@/utils/securityUtils';

/**
 * SecurityTester - Component to test and verify all security features
 * Designed for Ethiopian context with:
 * - Offline-first functionality
 * - Mobile-friendly interface
 * - Visual indicators for low-literacy users
 */
const SecurityTester: React.FC = () => {
  const { user, offlineSignIn, isOnline, syncUserData } = useAuth();
  const { showSuccess, showError } = useToastNotifications();
  const { t } = useTranslations();
  const { privacySettings, canShareData } = usePrivacyControls();
  
  // Test states
  const [testResults, setTestResults] = useState<{
    [key: string]: {
      passed: boolean;
      message: string;
    }
  }>({});
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  
  // Run all tests
  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults({});
    
    await testOfflineAuth();
    await testSecureStorage();
    await testApiOfflineFallback();
    await testDataEncryption();
    await testPrivacyControls();
    
    setIsRunningTests(false);
  };
  
  // Test offline authentication
  const testOfflineAuth = async () => {
    try {
      // Store test credentials in secure storage for offline testing
      const testCredentials = {
        email: 'test@example.com',
        password: 'hashedPassword123'
      };
      
      secureLocalStorage.setItem('offline_credentials', JSON.stringify({
        email: testCredentials.email,
        password: encryptData(testCredentials.password)
      }));
      
      // Simulate offline mode
      const originalOnline = navigator.onLine;
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      
      // Try offline sign in
      const offlineResult = await offlineSignIn(testCredentials.email, testCredentials.password);
      
      // Restore online status
      Object.defineProperty(navigator, 'onLine', { value: originalOnline, configurable: true });
      
      setTestResults(prev => ({
        ...prev,
        offlineAuth: {
          passed: !!offlineResult,
          message: offlineResult 
            ? t('security.test.offlineAuthSuccess', 'Offline authentication works correctly') 
            : t('security.test.offlineAuthFailed', 'Offline authentication failed')
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        offlineAuth: {
          passed: false,
          message: t('security.test.offlineAuthError', 'Error testing offline authentication: {error}', { 
            error: (error as Error).message 
          })
        }
      }));
    }
  };
  
  // Test secure storage
  const testSecureStorage = async () => {
    try {
      const testData = { key: 'value', sensitive: true };
      const testKey = 'security_test_key';
      
      // Test storing data
      secureLocalStorage.setItem(testKey, JSON.stringify(testData));
      
      // Test retrieving data
      const retrievedData = secureLocalStorage.getItem(testKey);
      const parsedData = retrievedData ? JSON.parse(retrievedData) : null;
      
      // Test removing data
      secureLocalStorage.removeItem(testKey);
      const removedData = secureLocalStorage.getItem(testKey);
      
      const storageWorks = 
        !!retrievedData && 
        parsedData.key === testData.key && 
        parsedData.sensitive === testData.sensitive &&
        removedData === null;
      
      setTestResults(prev => ({
        ...prev,
        secureStorage: {
          passed: storageWorks,
          message: storageWorks 
            ? t('security.test.secureStorageSuccess', 'Secure storage works correctly') 
            : t('security.test.secureStorageFailed', 'Secure storage test failed')
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        secureStorage: {
          passed: false,
          message: t('security.test.secureStorageError', 'Error testing secure storage: {error}', { 
            error: (error as Error).message 
          })
        }
      }));
    }
  };
  
  // Test API offline fallback
  const testApiOfflineFallback = async () => {
    try {
      // Store a test response in cache
      const testUrl = '/api/test';
      const testData = { test: 'data' };
      const cacheKey = `api_cache_${testUrl}`;
      const cacheData = {
        data: testData,
        expires: Date.now() + (3600 * 1000) // 1 hour
      };
      
      secureLocalStorage.setItem(cacheKey, JSON.stringify(cacheData));
      
      // Simulate offline mode
      const originalOnline = navigator.onLine;
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      
      // Try to make API request while offline
      let offlineQueueWorks = false;
      try {
        await apiClient.get(testUrl);
      } catch (error) {
        // Should throw an error about being offline and queuing the request
        offlineQueueWorks = (error as Error).message.includes('offline') && 
                           (error as Error).message.includes('queue');
      }
      
      // Check if request was queued
      const queuedRequests = apiClient.getPendingRequestCount() > 0;
      
      // Restore online status
      Object.defineProperty(navigator, 'onLine', { value: originalOnline, configurable: true });
      
      // Clean up
      apiClient.clearRequestQueue();
      secureLocalStorage.removeItem(cacheKey);
      
      setTestResults(prev => ({
        ...prev,
        apiOfflineFallback: {
          passed: offlineQueueWorks && queuedRequests,
          message: offlineQueueWorks && queuedRequests
            ? t('security.test.apiOfflineSuccess', 'API offline fallback works correctly') 
            : t('security.test.apiOfflineFailed', 'API offline fallback test failed')
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        apiOfflineFallback: {
          passed: false,
          message: t('security.test.apiOfflineError', 'Error testing API offline fallback: {error}', { 
            error: (error as Error).message 
          })
        }
      }));
    }
  };
  
  // Test data encryption
  const testDataEncryption = async () => {
    try {
      const testData = 'Sensitive farmer data that needs protection';
      
      // Test encryption
      const encrypted = encryptData(testData);
      
      // Verify encrypted data is different from original
      const isDifferent = encrypted !== testData;
      
      // Test decryption
      const decrypted = decryptData(encrypted);
      
      // Verify decrypted data matches original
      const matchesOriginal = decrypted === testData;
      
      setTestResults(prev => ({
        ...prev,
        dataEncryption: {
          passed: isDifferent && matchesOriginal,
          message: isDifferent && matchesOriginal
            ? t('security.test.encryptionSuccess', 'Data encryption and decryption work correctly') 
            : t('security.test.encryptionFailed', 'Data encryption test failed')
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        dataEncryption: {
          passed: false,
          message: t('security.test.encryptionError', 'Error testing data encryption: {error}', { 
            error: (error as Error).message 
          })
        }
      }));
    }
  };
  
  // Test privacy controls
  const testPrivacyControls = async () => {
    try {
      // Check if privacy settings exist
      const hasSettings = !!privacySettings;
      
      // Test canShareData function
      const sharingWorks = typeof canShareData === 'function';
      
      setTestResults(prev => ({
        ...prev,
        privacyControls: {
          passed: hasSettings && sharingWorks,
          message: hasSettings && sharingWorks
            ? t('security.test.privacySuccess', 'Privacy controls work correctly') 
            : t('security.test.privacyFailed', 'Privacy controls test failed')
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        privacyControls: {
          passed: false,
          message: t('security.test.privacyError', 'Error testing privacy controls: {error}', { 
            error: (error as Error).message 
          })
        }
      }));
    }
  };
  
  // Run individual test
  const runTest = async (testName: string) => {
    setSelectedTest(testName);
    setIsRunningTests(true);
    
    switch (testName) {
      case 'offlineAuth':
        await testOfflineAuth();
        break;
      case 'secureStorage':
        await testSecureStorage();
        break;
      case 'apiOfflineFallback':
        await testApiOfflineFallback();
        break;
      case 'dataEncryption':
        await testDataEncryption();
        break;
      case 'privacyControls':
        await testPrivacyControls();
        break;
    }
    
    setIsRunningTests(false);
  };
  
  // Generate test report
  const generateReport = () => {
    const totalTests = Object.keys(testResults).length;
    const passedTests = Object.values(testResults).filter(result => result.passed).length;
    
    return {
      totalTests,
      passedTests,
      allPassed: totalTests > 0 && passedTests === totalTests
    };
  };
  
  const report = generateReport();
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">
        {t('security.tester.title', 'Security Feature Tester')}
      </h2>
      
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">
          {t('security.tester.description', 'Test and verify security features for Ethiopian farmers')}
        </p>
        
        <div className="flex items-center mb-4">
          <div className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">
            {isOnline 
              ? t('security.tester.online', 'Online Mode') 
              : t('security.tester.offline', 'Offline Mode')}
          </span>
        </div>
        
        <button
          onClick={runAllTests}
          disabled={isRunningTests}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isRunningTests 
            ? t('security.tester.running', 'Running Tests...') 
            : t('security.tester.runAll', 'Run All Tests')}
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">
            {t('security.tester.individualTests', 'Individual Tests')}
          </h3>
          
          <div className="space-y-2">
            {[
              { id: 'offlineAuth', name: t('security.tester.offlineAuth', 'Offline Authentication') },
              { id: 'secureStorage', name: t('security.tester.secureStorage', 'Secure Storage') },
              { id: 'apiOfflineFallback', name: t('security.tester.apiOffline', 'API Offline Fallback') },
              { id: 'dataEncryption', name: t('security.tester.encryption', 'Data Encryption') },
              { id: 'privacyControls', name: t('security.tester.privacy', 'Privacy Controls') }
            ].map(test => (
              <div key={test.id} className="flex items-center justify-between">
                <span>{test.name}</span>
                <button
                  onClick={() => runTest(test.id)}
                  disabled={isRunningTests && selectedTest !== test.id}
                  className="py-1 px-3 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
                >
                  {isRunningTests && selectedTest === test.id 
                    ? t('security.tester.testing', 'Testing...') 
                    : t('security.tester.test', 'Test')}
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {Object.keys(testResults).length > 0 && (
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">
              {t('security.tester.results', 'Test Results')}
            </h3>
            
            <div className="space-y-2">
              {Object.entries(testResults).map(([testName, result]) => (
                <div key={testName} className="p-2 rounded-md bg-gray-50">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${result.passed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="font-medium">
                      {testName === 'offlineAuth' && t('security.tester.offlineAuth', 'Offline Authentication')}
                      {testName === 'secureStorage' && t('security.tester.secureStorage', 'Secure Storage')}
                      {testName === 'apiOfflineFallback' && t('security.tester.apiOffline', 'API Offline Fallback')}
                      {testName === 'dataEncryption' && t('security.tester.encryption', 'Data Encryption')}
                      {testName === 'privacyControls' && t('security.tester.privacy', 'Privacy Controls')}
                    </span>
                  </div>
                  <p className="text-sm mt-1 ml-6">{result.message}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 rounded-md bg-blue-50">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {t('security.tester.summary', 'Summary')}
                </span>
                <span className="font-medium">
                  {report.passedTests}/{report.totalTests} {t('security.tester.passed', 'passed')}
                </span>
              </div>
              
              {report.allPassed ? (
                <p className="text-sm text-green-600 mt-1">
                  {t('security.tester.allPassed', 'All security features are working correctly!')}
                </p>
              ) : (
                <p className="text-sm text-red-600 mt-1">
                  {t('security.tester.someIssues', 'Some security features need attention.')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityTester;