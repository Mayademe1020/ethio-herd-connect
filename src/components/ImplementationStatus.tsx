
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

export const ImplementationStatus = () => {
  const features = [
    {
      category: "Public Marketplace Discovery",
      items: [
        { name: "Public listing browsing without auth", status: "completed" },
        { name: "Hidden prices/contact for non-auth users", status: "completed" },
        { name: "Log in to see price CTAs", status: "completed" },
        { name: "Authentication gates after 3 views", status: "completed" },
        { name: "Smooth login flow maintaining intent", status: "completed" }
      ]
    },
    {
      category: "Advanced Analytics & Reports",
      items: [
        { name: "Financial reports dashboard", status: "completed" },
        { name: "Production trend analysis", status: "completed" },
        { name: "Health analytics framework", status: "partial" },
        { name: "Performance comparisons", status: "partial" },
        { name: "Export functionality", status: "planned" }
      ]
    },
    {
      category: "Milk Production Management",
      items: [
        { name: "Daily milk yield recording", status: "completed" },
        { name: "Milk quality tracking", status: "completed" },
        { name: "Production analytics", status: "completed" },
        { name: "Ethiopian calendar integration", status: "completed" },
        { name: "Mobile-optimized interface", status: "completed" }
      ]
    },
    {
      category: "SEO & Performance",
      items: [
        { name: "Public listing indexability", status: "partial" },
        { name: "Open Graph meta tags", status: "not-started" },
        { name: "Image optimization", status: "not-started" },
        { name: "Structured data markup", status: "not-started" }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'partial':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'planned':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-green-100 text-green-800",
      partial: "bg-yellow-100 text-yellow-800", 
      planned: "bg-blue-100 text-blue-800",
      "not-started": "bg-gray-100 text-gray-600"
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || variants["not-started"]}>
        {status.replace('-', ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Implementation Status Report
        </h2>
        <p className="text-gray-600">
          Current status of requested features and functionality
        </p>
      </div>

      {features.map((category, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg">{category.category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(item.status)}
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-800 mb-2">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">4</div>
              <div className="text-sm text-gray-600">Partial</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">1</div>
              <div className="text-sm text-gray-600">Planned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">4</div>
              <div className="text-sm text-gray-600">Not Started</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
