import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TestTube,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Zap,
  Target
} from 'lucide-react';
import { TestResult, TestSuite } from '@/types/admin';
import { adminService } from '@/services/adminService';

interface TestRunnerProps {
  className?: string;
}

export const TestRunner: React.FC<TestRunnerProps> = ({ className }) => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [runningTests, setRunningTests] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  const loadTestResults = async () => {
    try {
      setLoading(true);
      const results = await adminService.getTestResults();

      // Group results by test suite
      const suitesMap = new Map<string, TestResult[]>();
      results.forEach(result => {
        if (!suitesMap.has(result.test_suite)) {
          suitesMap.set(result.test_suite, []);
        }
        suitesMap.get(result.test_suite)!.push(result);
      });

      const suites: TestSuite[] = Array.from(suitesMap.entries()).map(([name, results]) => ({
        id: name,
        name,
        description: getSuiteDescription(name),
        test_count: results.length,
        last_run: results.length > 0 ? new Date(Math.max(...results.map(r => new Date(r.timestamp).getTime()))).toISOString() : undefined,
        status: results.some(r => r.status === 'failed') ? 'failed' : 'completed',
        results,
        coverage: results.length > 0 ? {
          statements: 85 + Math.random() * 10, // Mock coverage data
          branches: 80 + Math.random() * 15,
          functions: 90 + Math.random() * 8,
          lines: 87 + Math.random() * 10,
          timestamp: new Date().toISOString()
        } : undefined
      }));

      setTestSuites(suites);
      setLastRun(new Date());
    } catch (error) {
      console.error('Error loading test results:', error);
    } finally {
      setLoading(false);
    }
  };

  const runSystemTests = async () => {
    try {
      setRunningTests('all');
      const results = await adminService.runSystemTests();

      // Update test suites with new results
      await loadTestResults();
    } catch (error) {
      console.error('Error running system tests:', error);
    } finally {
      setRunningTests(null);
    }
  };

  const runSuiteTests = async (suiteName: string) => {
    try {
      setRunningTests(suiteName);
      // In production, this would call a specific suite test endpoint
      await new Promise(resolve => setTimeout(resolve, 2000)); // Mock delay
      await loadTestResults();
    } catch (error) {
      console.error(`Error running ${suiteName} tests:`, error);
    } finally {
      setRunningTests(null);
    }
  };

  useEffect(() => {
    loadTestResults();
  }, []);

  const getSuiteDescription = (suiteName: string): string => {
    const descriptions: Record<string, string> = {
      'auth': 'User authentication and authorization tests',
      'animals': 'Animal management and CRUD operations',
      'milk': 'Milk recording and analytics functionality',
      'marketplace': 'Marketplace listing and transaction tests',
      'offline': 'Offline functionality and sync tests',
      'performance': 'Performance and load testing',
      'security': 'Security and vulnerability tests',
      'api': 'API endpoint and integration tests'
    };
    return descriptions[suiteName] || `${suiteName} test suite`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'running': return 'text-blue-600';
      case 'skipped': return 'text-yellow-600';
      case 'error': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'skipped': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default: return <TestTube className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSuiteStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'running': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const calculatePassRate = (results: TestResult[]): number => {
    if (results.length === 0) return 0;
    const passed = results.filter(r => r.status === 'passed').length;
    return Math.round((passed / results.length) * 100);
  };

  const getOverallStats = () => {
    const allResults = testSuites.flatMap(suite => suite.results);
    const total = allResults.length;
    const passed = allResults.filter(r => r.status === 'passed').length;
    const failed = allResults.filter(r => r.status === 'failed').length;
    const running = 0; // Mock - no running tests in current implementation

    return { total, passed, failed, running, passRate: total > 0 ? Math.round((passed / total) * 100) : 0 };
  };

  const stats = getOverallStats();

  if (loading && testSuites.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TestTube className="h-5 w-5 mr-2" />
            Test Runner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <TestTube className="h-5 w-5 mr-2" />
              Automated Test Runner
            </CardTitle>
            <CardDescription>
              Run and monitor automated tests for system validation
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Last run: {lastRun.toLocaleTimeString()}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={loadTestResults}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="suites">Test Suites</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overall Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{stats.total}</p>
                      <p className="text-xs text-muted-foreground">Total Tests</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
                      <p className="text-xs text-muted-foreground">Passed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{stats.passRate}%</p>
                      <p className="text-xs text-muted-foreground">Pass Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pass Rate Progress */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Test Pass Rate</span>
                  <span className="text-sm text-muted-foreground">{stats.passRate}%</span>
                </div>
                <Progress value={stats.passRate} className="h-3" />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={runSystemTests}
                disabled={runningTests === 'all'}
                className="justify-start"
              >
                <Play className={`h-4 w-4 mr-2 ${runningTests === 'all' ? 'animate-pulse' : ''}`} />
                {runningTests === 'all' ? 'Running All Tests...' : 'Run All Tests'}
              </Button>
              <Button variant="outline" className="justify-start">
                <Zap className="h-4 w-4 mr-2" />
                Quick Health Check
              </Button>
              <Button variant="outline" className="justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>

            {/* Test Status Alert */}
            {stats.failed > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Test Failures Detected</AlertTitle>
                <AlertDescription>
                  {stats.failed} test(s) failed in the last run. Check the Results tab for details.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="suites" className="space-y-4">
            <div className="space-y-3">
              {testSuites.map((suite) => (
                <Card key={suite.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <TestTube className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{suite.name}</p>
                          <p className="text-sm text-muted-foreground">{suite.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSuiteStatusColor(suite.status)}>
                          {suite.status.toUpperCase()}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => runSuiteTests(suite.name)}
                          disabled={runningTests === suite.name}
                        >
                          <Play className={`h-3 w-3 mr-1 ${runningTests === suite.name ? 'animate-pulse' : ''}`} />
                          Run
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tests:</span>
                        <span className="font-medium ml-1">{suite.test_count}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Passed:</span>
                        <span className="font-medium ml-1 text-green-600">
                          {suite.results.filter(r => r.status === 'passed').length}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Failed:</span>
                        <span className="font-medium ml-1 text-red-600">
                          {suite.results.filter(r => r.status === 'failed').length}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Coverage:</span>
                        <span className="font-medium ml-1">
                          {suite.coverage ? `${Math.round(suite.coverage.lines)}%` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {suite.last_run && (
                      <div className="mt-3 text-xs text-muted-foreground">
                        Last run: {new Date(suite.last_run).toLocaleString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <div className="space-y-3">
              {testSuites.map((suite) => (
                <div key={suite.id} className="space-y-2">
                  <h4 className="font-medium text-sm">{suite.name} Suite</h4>
                  {suite.results.slice(0, 5).map((result, index) => (
                    <Card key={index}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(result.status)}
                            <div>
                              <p className="text-sm font-medium">{result.test_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {result.duration}ms • {new Date(result.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(result.status)}>
                            {result.status.toUpperCase()}
                          </Badge>
                        </div>
                        {result.error_message && (
                          <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                            {result.error_message}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {suite.results.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      And {suite.results.length - 5} more tests...
                    </p>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};