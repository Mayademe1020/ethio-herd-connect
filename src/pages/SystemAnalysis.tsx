import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, XCircle, AlertTriangle, Clock, Database, 
  Lock, TrendingUp, Code, FileText, Target, Zap, Wrench,
  ArrowRight, ChevronDown, ChevronRight
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import BottomNavigation from '@/components/BottomNavigation';
import { EnhancedHeader } from '@/components/EnhancedHeader';

interface FeatureStatus {
  name: string;
  status: 'complete' | 'partial' | 'planned' | 'missing';
  priority: 'critical' | 'high' | 'medium' | 'low';
  details: string[];
  usesRealData: boolean;
  hasSecurity: boolean;
  page?: string;
}

const SystemAnalysis = () => {
  const { language } = useLanguage();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // ============= COMPLETED FEATURES =============
  const completedFeatures: FeatureStatus[] = [
    {
      name: 'User Authentication',
      status: 'complete',
      priority: 'critical',
      usesRealData: true,
      hasSecurity: true,
      page: '/auth',
      details: [
        '✅ Email/password authentication',
        '✅ Sign up & sign in flows',
        '✅ Session management with Supabase',
        '✅ Profile creation',
        '✅ Logout functionality',
        '⚠️ Missing: Password reset flow',
        '⚠️ Missing: Email verification toggle info'
      ]
    },
    {
      name: 'Animal Registration',
      status: 'complete',
      priority: 'critical',
      usesRealData: true,
      hasSecurity: true,
      page: '/animals',
      details: [
        '✅ Single animal registration',
        '✅ Calf registration with parent tracking',
        '✅ Poultry group registration',
        '✅ Auto-generated animal codes',
        '✅ Farm profile integration',
        '✅ Photo upload support',
        '✅ RLS policies enabled',
        '✅ Offline support with sync queue'
      ]
    },
    {
      name: 'Farm Profile Management',
      status: 'complete',
      priority: 'high',
      usesRealData: true,
      hasSecurity: true,
      page: '/profile',
      details: [
        '✅ Farm setup form',
        '✅ Farm prefix for animal codes',
        '✅ Database function for code generation',
        '✅ User-specific farm profiles',
        '✅ RLS protection'
      ]
    },
    {
      name: 'Multi-language Support',
      status: 'complete',
      priority: 'high',
      usesRealData: true,
      hasSecurity: false,
      details: [
        '✅ 4 languages: Amharic, English, Oromo, Swahili',
        '✅ Context-based translations',
        '✅ Language selector component',
        '✅ Persistent language preference',
        '✅ Translations across all pages'
      ]
    },
    {
      name: 'Database Security (RLS)',
      status: 'complete',
      priority: 'critical',
      usesRealData: true,
      hasSecurity: true,
      details: [
        '✅ RLS enabled on all tables',
        '✅ User-specific data access',
        '✅ Security definer functions',
        '✅ Protected marketplace contact info',
        '✅ Audit logging system',
        '✅ Account security table',
        '✅ Only 3 minor linter warnings remain'
      ]
    },
    {
      name: 'Health Records',
      status: 'complete',
      priority: 'high',
      usesRealData: true,
      hasSecurity: true,
      page: '/medical',
      details: [
        '✅ Vaccination recording (single & bulk)',
        '✅ Illness reporting',
        '✅ Health submissions to support',
        '✅ Photo upload for health issues',
        '✅ Database tables with RLS',
        '⚠️ Mock data in UI for display'
      ]
    },
    {
      name: 'Storage/File Upload',
      status: 'complete',
      priority: 'medium',
      usesRealData: true,
      hasSecurity: true,
      details: [
        '✅ Two public buckets: animal-photos, health-photos',
        '✅ Photo upload in registration forms',
        '✅ Photo upload in health forms',
        '✅ Photo upload in marketplace',
        '✅ Secure file handling'
      ]
    },
    {
      name: 'Offline Support',
      status: 'complete',
      priority: 'medium',
      usesRealData: true,
      hasSecurity: false,
      details: [
        '✅ Offline detection',
        '✅ Sync queue implementation',
        '✅ LocalStorage persistence',
        '✅ Auto-sync when online',
        '✅ Offline indicator UI',
        '⚠️ Limited testing in production scenarios'
      ]
    }
  ];

  // ============= PARTIALLY COMPLETE FEATURES =============
  const partialFeatures: FeatureStatus[] = [
    {
      name: 'Dashboard/Home',
      status: 'partial',
      priority: 'high',
      usesRealData: false,
      hasSecurity: false,
      page: '/',
      details: [
        '✅ Beautiful UI design',
        '✅ Summary cards',
        '✅ Quick actions',
        '✅ Search functionality',
        '❌ Uses mock data for statistics',
        '❌ No real animal fetching',
        '❌ Hardcoded values',
        '🔧 NEEDS: Connection to real animals table',
        '🔧 NEEDS: Real-time stats calculation',
        '🔧 NEEDS: Recent activity from database'
      ]
    },
    {
      name: 'Animals List/Management',
      status: 'partial',
      priority: 'critical',
      usesRealData: true,
      hasSecurity: true,
      page: '/animals',
      details: [
        '✅ Fetches real animals from database',
        '✅ Multiple view modes (grid/list/table)',
        '✅ Filtering and search',
        '✅ Animal detail modal',
        '❌ Edit functionality not connected',
        '❌ Delete functionality missing',
        '❌ Bulk operations incomplete',
        '🔧 NEEDS: Full CRUD operations',
        '🔧 NEEDS: Animal transfer between users'
      ]
    },
    {
      name: 'Growth Tracking',
      status: 'partial',
      priority: 'high',
      usesRealData: false,
      hasSecurity: true,
      page: '/growth',
      details: [
        '✅ Weight entry form',
        '✅ Growth charts UI',
        '✅ Database table exists (growth_records)',
        '✅ RLS policies in place',
        '❌ All data is mock/hardcoded',
        '❌ Not fetching from growth_records table',
        '❌ Chart data not real',
        '🔧 NEEDS: Connect to real database',
        '🔧 NEEDS: Historical growth data display',
        '🔧 NEEDS: Growth analytics'
      ]
    },
    {
      name: 'Public Marketplace',
      status: 'partial',
      priority: 'high',
      usesRealData: true,
      hasSecurity: true,
      page: '/marketplace',
      details: [
        '✅ Beautiful professional UI',
        '✅ Fetches real listings from database',
        '✅ Contact info protection (RLS)',
        '✅ Buyer interest system',
        '✅ View tracking',
        '❌ Uses mock data as fallback',
        '❌ Favorites not saved to database',
        '❌ Share functionality placeholder',
        '🔧 NEEDS: Remove mock data dependencies',
        '🔧 NEEDS: Implement persistent favorites',
        '🔧 NEEDS: Real sharing (WhatsApp, etc.)'
      ]
    },
    {
      name: 'Private Market (User Listings)',
      status: 'partial',
      priority: 'high',
      usesRealData: true,
      hasSecurity: true,
      page: '/market',
      details: [
        '✅ User can create listings',
        '✅ View own listings',
        '✅ Database integration',
        '✅ Contact method selection',
        '❌ Edit listing not implemented',
        '❌ Delete listing not implemented',
        '❌ Status management incomplete',
        '🔧 NEEDS: Full listing management',
        '🔧 NEEDS: Analytics for listings'
      ]
    },
    {
      name: 'Milk Production',
      status: 'partial',
      priority: 'medium',
      usesRealData: true,
      hasSecurity: true,
      page: '/milk',
      details: [
        '✅ Database table exists',
        '✅ RLS policies configured',
        '✅ Basic form structure',
        '❌ UI needs completion',
        '❌ Recording functionality incomplete',
        '❌ Analytics not implemented',
        '🔧 NEEDS: Complete milk recording form',
        '🔧 NEEDS: Daily/weekly/monthly reports',
        '🔧 NEEDS: Production trends'
      ]
    },
    {
      name: 'Analytics & Reports',
      status: 'partial',
      priority: 'medium',
      usesRealData: false,
      hasSecurity: false,
      page: '/analytics',
      details: [
        '✅ Page exists',
        '✅ Chart components available',
        '❌ All data is mock',
        '❌ No real calculations',
        '❌ No report generation',
        '🔧 NEEDS: Real data aggregation',
        '🔧 NEEDS: Financial reporting',
        '🔧 NEEDS: Growth analytics',
        '🔧 NEEDS: Health analytics',
        '🔧 NEEDS: Export functionality'
      ]
    },
    {
      name: 'Notifications',
      status: 'partial',
      priority: 'medium',
      usesRealData: true,
      hasSecurity: true,
      page: '/notifications',
      details: [
        '✅ Database table exists',
        '✅ RLS enabled',
        '✅ UI component',
        '❌ Uses hardcoded mock data',
        '❌ Not connected to real events',
        '🔧 NEEDS: Real-time notifications',
        '🔧 NEEDS: Trigger system for events',
        '🔧 NEEDS: Mark as read functionality',
        '🔧 NEEDS: Push notifications'
      ]
    },
    {
      name: 'Staff/Assistant Management',
      status: 'partial',
      priority: 'low',
      usesRealData: true,
      hasSecurity: true,
      details: [
        '✅ Database table (farm_assistants)',
        '✅ RLS policies',
        '✅ Permission system structure',
        '❌ UI needs work',
        '❌ Invitation system incomplete',
        '🔧 NEEDS: Email invitations',
        '🔧 NEEDS: Role-based permissions',
        '🔧 NEEDS: Activity tracking'
      ]
    }
  ];

  // ============= MISSING/PLANNED FEATURES =============
  const missingFeatures: FeatureStatus[] = [
    {
      name: 'Ethiopian Calendar Integration',
      status: 'planned',
      priority: 'high',
      usesRealData: false,
      hasSecurity: false,
      details: [
        '📋 Component exists: EthiopianDatePicker',
        '❌ Not integrated in forms',
        '❌ Date conversion not implemented',
        '🔧 NEEDS: Full Ethiopian calendar support',
        '🔧 NEEDS: Date display toggle',
        '🔧 NEEDS: Cultural calendar preferences'
      ]
    },
    {
      name: 'Financial Management',
      status: 'planned',
      priority: 'high',
      usesRealData: true,
      hasSecurity: true,
      details: [
        '✅ Database table exists (financial_records)',
        '✅ RLS policies',
        '❌ No UI implemented',
        '❌ No income/expense tracking',
        '❌ No profit calculations',
        '🔧 NEEDS: Complete financial module',
        '🔧 NEEDS: Budget management',
        '🔧 NEEDS: Transaction history',
        '🔧 NEEDS: Financial reports'
      ]
    },
    {
      name: 'Feed Inventory Management',
      status: 'planned',
      priority: 'medium',
      usesRealData: true,
      hasSecurity: true,
      details: [
        '✅ Database table exists (feed_inventory)',
        '✅ RLS policies',
        '❌ No UI implemented',
        '❌ No feed tracking',
        '❌ No consumption calculations',
        '🔧 NEEDS: Feed inventory UI',
        '🔧 NEEDS: Stock alerts',
        '🔧 NEEDS: Feed consumption analytics',
        '🔧 NEEDS: Supplier management'
      ]
    },
    {
      name: 'AI Assistant/Insights',
      status: 'planned',
      priority: 'medium',
      usesRealData: false,
      hasSecurity: false,
      details: [
        '📋 Mentioned in design',
        '❌ Not implemented',
        '🔧 NEEDS: Lovable AI Gateway integration',
        '🔧 NEEDS: Smart recommendations',
        '🔧 NEEDS: Health issue detection',
        '🔧 NEEDS: Growth predictions'
      ]
    },
    {
      name: 'Veterinary Support Integration',
      status: 'planned',
      priority: 'high',
      usesRealData: true,
      hasSecurity: true,
      details: [
        '✅ Health submission form exists',
        '✅ Database table (health_submissions)',
        '❌ No vet response system',
        '❌ No vet verification process',
        '❌ No appointment scheduling',
        '🔧 NEEDS: Vet dashboard',
        '🔧 NEEDS: Two-way communication',
        '🔧 NEEDS: Consultation history'
      ]
    },
    {
      name: 'Vaccination Schedule System',
      status: 'planned',
      priority: 'high',
      usesRealData: true,
      hasSecurity: false,
      details: [
        '✅ Database table (vaccination_schedules)',
        '✅ Preloaded schedule data',
        '❌ Not showing in UI',
        '❌ No reminders implemented',
        '❌ No schedule tracking',
        '🔧 NEEDS: Automatic reminders',
        '🔧 NEEDS: Schedule adherence tracking',
        '🔧 NEEDS: Regional vaccination calendars'
      ]
    },
    {
      name: 'Breeding Management',
      status: 'missing',
      priority: 'medium',
      usesRealData: false,
      hasSecurity: false,
      details: [
        '❌ No database table',
        '❌ No UI',
        '🔧 NEEDS: Breeding records',
        '🔧 NEEDS: Heat cycle tracking',
        '🔧 NEEDS: Pregnancy monitoring',
        '🔧 NEEDS: Birth records',
        '🔧 NEEDS: Lineage tracking'
      ]
    },
    {
      name: 'Document Management',
      status: 'missing',
      priority: 'low',
      usesRealData: false,
      hasSecurity: false,
      details: [
        '❌ No implementation',
        '🔧 NEEDS: Upload certificates',
        '🔧 NEEDS: Vaccination records',
        '🔧 NEEDS: Purchase receipts',
        '🔧 NEEDS: Medical documents'
      ]
    },
    {
      name: 'SMS/WhatsApp Notifications',
      status: 'missing',
      priority: 'medium',
      usesRealData: false,
      hasSecurity: false,
      details: [
        '❌ No edge function',
        '❌ No integration',
        '🔧 NEEDS: SMS gateway integration',
        '🔧 NEEDS: WhatsApp Business API',
        '🔧 NEEDS: Message templates',
        '🔧 NEEDS: Notification preferences'
      ]
    },
    {
      name: 'Community Forum/Marketplace',
      status: 'missing',
      priority: 'low',
      usesRealData: false,
      hasSecurity: false,
      details: [
        '📋 Component placeholder exists',
        '❌ No implementation',
        '🔧 NEEDS: Forum database structure',
        '🔧 NEEDS: Post/comment system',
        '🔧 NEEDS: Knowledge sharing',
        '🔧 NEEDS: Expert Q&A'
      ]
    },
    {
      name: 'Insurance Integration',
      status: 'missing',
      priority: 'low',
      usesRealData: false,
      hasSecurity: false,
      details: [
        '❌ No implementation',
        '🔧 NEEDS: Insurance provider integration',
        '🔧 NEEDS: Policy management',
        '🔧 NEEDS: Claim tracking'
      ]
    },
    {
      name: 'Weather Integration',
      status: 'missing',
      priority: 'low',
      usesRealData: false,
      hasSecurity: false,
      details: [
        '📋 Weather card placeholder exists',
        '❌ No API integration',
        '🔧 NEEDS: Local weather data',
        '🔧 NEEDS: Agricultural forecasts',
        '🔧 NEEDS: Alerts for extreme weather'
      ]
    }
  ];

  // ============= TECHNICAL DEBT & CODE QUALITY =============
  const technicalIssues = [
    {
      severity: 'high',
      category: 'Code Quality',
      issues: [
        '95+ console.log statements (debugging artifacts)',
        'Duplicate useOfflineSync files (useOfflineSync.ts and useOfflineSync.tsx)',
        'Mock data scattered across components',
        'Inconsistent error handling',
        'Missing TypeScript types in some places'
      ]
    },
    {
      severity: 'medium',
      category: 'Performance',
      issues: [
        'No pagination on animals list',
        'No lazy loading for images',
        'No query optimization',
        'Potentially redundant re-renders',
        'Large bundle size not analyzed'
      ]
    },
    {
      severity: 'medium',
      category: 'Security',
      issues: [
        '3 Supabase linter warnings remain',
        'Some console.log may leak sensitive info',
        'Input sanitization needs review',
        'Rate limiting only partially implemented'
      ]
    },
    {
      severity: 'low',
      category: 'UX/UI',
      issues: [
        'Inconsistent loading states',
        'Some forms lack validation feedback',
        'Mobile responsiveness needs testing',
        'Accessibility (a11y) not fully implemented',
        'No skeleton loaders in some areas'
      ]
    }
  ];

  // ============= UNUSED DATABASE RESOURCES =============
  const unusedResources = [
    {
      type: 'Table',
      name: 'public_market_view',
      issue: 'View exists but seems redundant with public_market_listings',
      action: 'Review if both views are needed or consolidate'
    },
    {
      type: 'Table',
      name: 'listing_views',
      issue: 'View tracking implemented but analytics not shown to users',
      action: 'Create analytics dashboard for sellers'
    },
    {
      type: 'Table',
      name: 'audit_logs',
      issue: 'Table exists but audit logging not fully implemented across all operations',
      action: 'Complete audit trail for all critical operations'
    },
    {
      type: 'Function',
      name: 'can_view_contact_info',
      issue: 'Exists alongside can_access_listing_contact - potential duplication',
      action: 'Consolidate security functions'
    }
  ];

  // ============= PRIORITY RECOMMENDATIONS =============
  const recommendations = [
    {
      priority: 'CRITICAL - Week 1',
      items: [
        '🔥 Connect Dashboard to real data (remove all mock data)',
        '🔥 Complete Animals CRUD (edit, delete, bulk operations)',
        '🔥 Connect Growth page to growth_records table',
        '🔥 Remove all console.log statements',
        '🔥 Fix duplicate useOfflineSync files'
      ]
    },
    {
      priority: 'HIGH - Week 2',
      items: [
        '⚡ Complete Milk Production module',
        '⚡ Implement Financial Management UI',
        '⚡ Add Feed Inventory Management',
        '⚡ Complete Analytics with real data',
        '⚡ Implement Vaccination Schedule reminders'
      ]
    },
    {
      priority: 'MEDIUM - Week 3-4',
      items: [
        '📊 Add Breeding Management',
        '📊 Integrate Ethiopian Calendar',
        '📊 Implement SMS/WhatsApp notifications',
        '📊 Add report generation & export',
        '📊 Create Veterinary dashboard'
      ]
    },
    {
      priority: 'LOW - Future Enhancements',
      items: [
        '💡 AI Assistant with Lovable AI Gateway',
        '💡 Community Forum',
        '💡 Insurance Integration',
        '💡 Weather Integration',
        '💡 Document Management',
        '💡 Multi-farm management'
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      complete: { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle2 },
      partial: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock },
      planned: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Target },
      missing: { color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle }
    };
    const variant = variants[status];
    const Icon = variant.icon;
    return (
      <Badge className={`${variant.color} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={colors[priority]}>{priority.toUpperCase()}</Badge>;
  };

  const FeatureCard = ({ feature }: { feature: FeatureStatus }) => {
    const isExpanded = expandedSection === feature.name;
    return (
      <Card className="mb-3 hover:shadow-lg transition-shadow">
        <CardHeader 
          className="cursor-pointer"
          onClick={() => toggleSection(feature.name)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg">{feature.name}</CardTitle>
                {feature.page && (
                  <Badge variant="outline" className="text-xs">
                    {feature.page}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(feature.status)}
                {getPriorityBadge(feature.priority)}
                {feature.usesRealData && (
                  <Badge className="bg-blue-50 text-blue-700 border border-blue-200">
                    <Database className="w-3 h-3 mr-1" />
                    Real Data
                  </Badge>
                )}
                {feature.hasSecurity && (
                  <Badge className="bg-purple-50 text-purple-700 border border-purple-200">
                    <Lock className="w-3 h-3 mr-1" />
                    Secured
                  </Badge>
                )}
              </div>
            </div>
            {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent>
            <ul className="space-y-1 text-sm">
              {feature.details.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1">{detail.startsWith('✅') ? '✅' : detail.startsWith('❌') ? '❌' : detail.startsWith('⚠️') ? '⚠️' : '🔧'}</span>
                  <span className={
                    detail.startsWith('✅') ? 'text-green-700' :
                    detail.startsWith('❌') ? 'text-red-700' :
                    detail.startsWith('⚠️') ? 'text-orange-700' :
                    'text-blue-700'
                  }>{detail.substring(2)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-20">
      <EnhancedHeader />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🔍 Livestock Management System
          </h1>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-700">
            Professional Analysis & Roadmap
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Comprehensive assessment of implementation status, technical debt, and strategic recommendations
          </p>
        </div>

        {/* Executive Summary */}
        <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <AlertDescription className="text-sm">
            <strong>System Health:</strong> {completedFeatures.length} features complete, {partialFeatures.length} partial, {missingFeatures.length} planned/missing.
            Core functionality is operational with strong security foundation. Primary focus needed: connecting mock data to real database, completing CRUD operations, and building out analytics.
          </AlertDescription>
        </Alert>

        {/* Main Tabs */}
        <Tabs defaultValue="complete" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 h-auto p-2">
            <TabsTrigger value="complete" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Complete ({completedFeatures.length})
            </TabsTrigger>
            <TabsTrigger value="partial" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
              <Clock className="w-4 h-4 mr-2" />
              Partial ({partialFeatures.length})
            </TabsTrigger>
            <TabsTrigger value="missing" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
              <XCircle className="w-4 h-4 mr-2" />
              Missing ({missingFeatures.length})
            </TabsTrigger>
            <TabsTrigger value="technical" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              <Wrench className="w-4 h-4 mr-2" />
              Tech Debt
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Target className="w-4 h-4 mr-2" />
              Roadmap
            </TabsTrigger>
          </TabsList>

          {/* Completed Features Tab */}
          <TabsContent value="complete" className="mt-6 space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertDescription>
                <strong>{completedFeatures.length} features fully operational</strong> with real database integration and security measures in place.
              </AlertDescription>
            </Alert>
            {completedFeatures.map((feature, idx) => (
              <FeatureCard key={idx} feature={feature} />
            ))}
          </TabsContent>

          {/* Partial Features Tab */}
          <TabsContent value="partial" className="mt-6 space-y-4">
            <Alert className="bg-yellow-50 border-yellow-200">
              <Clock className="h-5 w-5 text-yellow-600" />
              <AlertDescription>
                <strong>{partialFeatures.length} features need completion.</strong> These have foundation in place but require additional work to be fully functional.
              </AlertDescription>
            </Alert>
            {partialFeatures.map((feature, idx) => (
              <FeatureCard key={idx} feature={feature} />
            ))}
          </TabsContent>

          {/* Missing Features Tab */}
          <TabsContent value="missing" className="mt-6 space-y-4">
            <Alert className="bg-red-50 border-red-200">
              <XCircle className="h-5 w-5 text-red-600" />
              <AlertDescription>
                <strong>{missingFeatures.length} features planned or missing.</strong> These require new development from ground up.
              </AlertDescription>
            </Alert>
            {missingFeatures.map((feature, idx) => (
              <FeatureCard key={idx} feature={feature} />
            ))}
          </TabsContent>

          {/* Technical Debt Tab */}
          <TabsContent value="technical" className="mt-6 space-y-6">
            <Alert className="bg-purple-50 border-purple-200">
              <Wrench className="h-5 w-5 text-purple-600" />
              <AlertDescription>
                <strong>Technical improvements needed</strong> to enhance code quality, performance, and maintainability.
              </AlertDescription>
            </Alert>

            {technicalIssues.map((section, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {section.category}
                    </CardTitle>
                    <Badge className={
                      section.severity === 'high' ? 'bg-red-100 text-red-800' :
                      section.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {section.severity.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.issues.map((issue, issueIdx) => (
                      <li key={issueIdx} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardHeader>
                <CardTitle>⚠️ Unused/Underutilized Database Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {unusedResources.map((resource, idx) => (
                    <div key={idx} className="border-l-4 border-orange-400 pl-4 py-2">
                      <div className="font-semibold text-sm flex items-center gap-2">
                        <Badge variant="outline">{resource.type}</Badge>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{resource.name}</code>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{resource.issue}</p>
                      <p className="text-sm text-blue-600 mt-1">
                        <ArrowRight className="w-3 h-3 inline mr-1" />
                        {resource.action}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roadmap Tab */}
          <TabsContent value="roadmap" className="mt-6 space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <Target className="h-5 w-5 text-blue-600" />
              <AlertDescription>
                <strong>Strategic roadmap</strong> prioritizing features by business impact and technical dependencies.
              </AlertDescription>
            </Alert>

            {recommendations.map((phase, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-500" />
                    {phase.priority}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {phase.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-3 text-sm p-2 hover:bg-gray-50 rounded">
                        <span className="text-lg">{item.substring(0, 2)}</span>
                        <span className="flex-1">{item.substring(3)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}

            <Card className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardHeader>
                <CardTitle>🎯 Success Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Phase 1 Goals (Week 1-2)</h4>
                    <ul className="space-y-1">
                      <li>✓ 100% real data (no mock data)</li>
                      <li>✓ Complete Animals CRUD operations</li>
                      <li>✓ Working Growth tracking</li>
                      <li>✓ Clean codebase (no console.logs)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Phase 2 Goals (Week 3-4)</h4>
                    <ul className="space-y-1">
                      <li>✓ Financial module operational</li>
                      <li>✓ Milk production tracking</li>
                      <li>✓ Feed inventory management</li>
                      <li>✓ Complete analytics dashboard</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Stats Summary */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Quick Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-green-600">{completedFeatures.length}</div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-600">{partialFeatures.length}</div>
                <div className="text-sm text-gray-600">Partial</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-600">{missingFeatures.length}</div>
                <div className="text-sm text-gray-600">Missing</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {Math.round((completedFeatures.length / (completedFeatures.length + partialFeatures.length + missingFeatures.length)) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Overall Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation language={language} />
    </div>
  );
};

export default SystemAnalysis;
