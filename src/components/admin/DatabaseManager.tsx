import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Database,
  HardDrive,
  Zap,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  BarChart3
} from 'lucide-react';
import { DatabaseMetrics, BackupStatus, MigrationStatus } from '@/types/admin';
import { adminService } from '@/services/adminService';

interface DatabaseManagerProps {
  className?: string;
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({ className }) => {
  const [metrics, setMetrics] = useState<DatabaseMetrics | null>(null);
  const [backupStatus, setBackupStatus] = useState<BackupStatus | null>(null);
  const [migrations, setMigrations] = useState<MigrationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadDatabaseData = async () => {
    try {
      setLoading(true);
      const [dbMetrics, migrationsData] = await Promise.all([
        adminService.getDatabaseMetrics(),
        // Mock migrations data - in production this would come from API
        Promise.resolve([
          {
            id: 'mig_001',
            name: 'add_custom_breed_support',
            status: 'completed',
            executed_at: '2024-10-21T23:21:33Z',
            executed_by: 'admin'
          },
          {
            id: 'mig_002',
            name: 'performance_indexes',
            status: 'completed',
            executed_at: '2024-10-25T00:00:00Z',
            executed_by: 'admin'
          },
          {
            id: 'mig_003',
            name: 'add_user_profiles',
            status: 'pending'
          }
        ] as any[])
      ]);

      setMetrics(dbMetrics);
      setBackupStatus(dbMetrics.backup_status);
      setMigrations(migrationsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading database data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(loadDatabaseData, 300000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateBackup = async () => {
    try {
      setOperationLoading('backup');
      const result = await adminService.createDatabaseBackup();
      if (result.success) {
        await loadDatabaseData(); // Refresh data
      }
    } catch (error) {
      console.error('Error creating backup:', error);
    } finally {
      setOperationLoading(null);
    }
  };

  const handleRunMigrations = async () => {
    try {
      setOperationLoading('migrate');
      const result = await adminService.runDatabaseMigrations();
      if (result.success) {
        await loadDatabaseData(); // Refresh data
      }
    } catch (error) {
      console.error('Error running migrations:', error);
    } finally {
      setOperationLoading(null);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success': return 'text-green-600';
      case 'running':
      case 'in_progress': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'running':
      case 'in_progress': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Database className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading && !metrics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Database Manager
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
              <Database className="h-5 w-5 mr-2" />
              Database Manager
            </CardTitle>
            <CardDescription>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadDatabaseData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
            <TabsTrigger value="migrations">Migrations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Server className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{metrics?.connection_count || 0}</p>
                      <p className="text-xs text-muted-foreground">Active Connections</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{metrics?.query_count || 0}</p>
                      <p className="text-xs text-muted-foreground">Queries/Hour</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-2xl font-bold">{metrics?.slow_queries || 0}</p>
                      <p className="text-xs text-muted-foreground">Slow Queries</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {metrics?.table_sizes.reduce((sum, table) => sum + table.size_mb, 0).toFixed(1)} MB
                      </p>
                      <p className="text-xs text-muted-foreground">Total Size</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={handleCreateBackup}
                disabled={operationLoading === 'backup'}
                className="justify-start"
              >
                <Download className={`h-4 w-4 mr-2 ${operationLoading === 'backup' ? 'animate-spin' : ''}`} />
                {operationLoading === 'backup' ? 'Creating Backup...' : 'Create Backup'}
              </Button>
              <Button
                variant="outline"
                onClick={handleRunMigrations}
                disabled={operationLoading === 'migrate'}
                className="justify-start"
              >
                <Upload className={`h-4 w-4 mr-2 ${operationLoading === 'migrate' ? 'animate-spin' : ''}`} />
                {operationLoading === 'migrate' ? 'Running Migrations...' : 'Run Migrations'}
              </Button>
              <Button variant="outline" className="justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Query Performance
              </Button>
            </div>

            {/* Performance Alert */}
            {metrics && metrics.slow_queries > 5 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Performance Issue Detected</AlertTitle>
                <AlertDescription>
                  {metrics.slow_queries} slow queries detected. Consider optimizing database indexes.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="tables" className="space-y-4">
            <div className="space-y-3">
              {metrics?.table_sizes.map((table, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Database className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{table.table_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {table.row_count.toLocaleString()} rows
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{table.size_mb.toFixed(2)} MB</p>
                        <p className="text-sm text-muted-foreground">
                          {table.growth_rate > 0 ? '+' : ''}{table.growth_rate.toFixed(1)}% growth
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress
                        value={Math.min((table.size_mb / 100) * 100, 100)}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="backup" className="space-y-6">
            {backupStatus && (
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(backupStatus.status)}
                        <div>
                          <p className="font-medium">Last Backup</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(backupStatus.last_backup).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(backupStatus.status)}>
                        {backupStatus.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Backup Size</p>
                        <p className="font-medium">{formatBytes(backupStatus.backup_size)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Next Backup</p>
                        <p className="font-medium">
                          {new Date(backupStatus.next_backup).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex space-x-4">
                  <Button onClick={handleCreateBackup} disabled={operationLoading === 'backup'}>
                    <Download className="h-4 w-4 mr-2" />
                    {operationLoading === 'backup' ? 'Creating...' : 'Create New Backup'}
                  </Button>
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restore from Backup
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="migrations" className="space-y-4">
            <div className="space-y-3">
              {migrations.map((migration) => (
                <Card key={migration.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(migration.status)}
                        <div>
                          <p className="font-medium">{(migration as any).migration_name || migration.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {migration.executed_at ?
                              `Executed: ${new Date(migration.executed_at).toLocaleString()}` :
                              'Pending execution'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(migration.status)}>
                          {migration.status.toUpperCase()}
                        </Badge>
                        {(migration as any).executed_by && (
                          <p className="text-xs text-muted-foreground mt-1">
                            by {(migration as any).executed_by}
                          </p>
                        )}
                      </div>
                    </div>
                    {migration.error_message && (
                      <Alert className="mt-3">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{migration.error_message}</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end">
              <Button onClick={handleRunMigrations} disabled={operationLoading === 'migrate'}>
                <Upload className="h-4 w-4 mr-2" />
                {operationLoading === 'migrate' ? 'Running...' : 'Run Pending Migrations'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};