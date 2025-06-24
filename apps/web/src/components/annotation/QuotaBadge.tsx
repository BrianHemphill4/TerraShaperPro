'use client';

import { useEffect, useState } from 'react';
import { useFeatureGate } from '@/hooks/useFeatureGate';

export interface QuotaBadgeProps {
  className?: string;
  showDetails?: boolean;
}

interface QuotaInfo {
  renders: {
    used: number;
    limit: number;
    percentage: number;
    exceeded: boolean;
  };
  storage: {
    used: number;
    limit: number;
    percentage: number;
    exceeded: boolean;
  };
  projects: {
    used: number;
    limit: number;
    percentage: number;
    exceeded: boolean;
  };
}

export function QuotaBadge({ className = '', showDetails = false }: QuotaBadgeProps) {
  const { currentTier, checkUsageLimit } = useFeatureGate();
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching current usage data
    // In a real app, this would come from your API
    const fetchQuotaInfo = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock current usage data
      const mockUsage = {
        renders: Math.floor(Math.random() * 80), // Random usage for demo
        storage: Math.floor(Math.random() * 40),
        projects: Math.floor(Math.random() * 8),
      };

      const renders = checkUsageLimit('maxRendersPerMonth', mockUsage.renders);
      const storage = checkUsageLimit('maxStorageGb', mockUsage.storage);
      const projects = checkUsageLimit('maxProjects', mockUsage.projects);

      setQuotaInfo({
        renders: {
          used: renders.usage,
          limit: renders.limit,
          percentage: renders.percentage,
          exceeded: renders.exceeded,
        },
        storage: {
          used: storage.usage,
          limit: storage.limit,
          percentage: storage.percentage,
          exceeded: storage.exceeded,
        },
        projects: {
          used: projects.usage,
          limit: projects.limit,
          percentage: projects.percentage,
          exceeded: projects.exceeded,
        },
      });
      
      setIsLoading(false);
    };

    fetchQuotaInfo();
  }, [checkUsageLimit]);

  if (isLoading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg p-3 ${className}`}>
        <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
        <div className="h-2 bg-gray-300 rounded w-full"></div>
      </div>
    );
  }

  if (!quotaInfo) {
    return null;
  }

  // Determine overall status
  const hasAnyExceeded = Object.values(quotaInfo).some(quota => quota.exceeded);
  const hasAnyWarning = Object.values(quotaInfo).some(quota => quota.percentage > 80 && !quota.exceeded);
  
  const statusColor = hasAnyExceeded ? 'red' : hasAnyWarning ? 'yellow' : 'green';
  const statusText = hasAnyExceeded ? 'Quota Exceeded' : hasAnyWarning ? 'Quota Warning' : 'Quota Healthy';

  const getQuotaDisplay = (quota: typeof quotaInfo.renders) => {
    if (quota.limit === -1) return 'Unlimited';
    return `${quota.used}/${quota.limit}`;
  };

  const getProgressBarColor = (quota: typeof quotaInfo.renders) => {
    if (quota.exceeded) return 'bg-red-500';
    if (quota.percentage > 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (!showDetails) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${className}`}>
        <div 
          className={`w-2 h-2 rounded-full ${
            statusColor === 'red' ? 'bg-red-500' :
            statusColor === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
          }`}
        />
        <span className="font-medium capitalize">{currentTier}</span>
        <span className="text-gray-600">{statusText}</span>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Usage & Quotas</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full capitalize">
          {currentTier}
        </span>
      </div>

      <div className="space-y-4">
        {/* Renders */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Renders</span>
            <span className="text-sm font-medium">
              {getQuotaDisplay(quotaInfo.renders)}
            </span>
          </div>
          {quotaInfo.renders.limit !== -1 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(quotaInfo.renders)}`}
                style={{ width: `${Math.min(quotaInfo.renders.percentage, 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Storage */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Storage</span>
            <span className="text-sm font-medium">
              {quotaInfo.storage.limit === -1 
                ? `${quotaInfo.storage.used}GB / Unlimited`
                : `${quotaInfo.storage.used}GB / ${quotaInfo.storage.limit}GB`
              }
            </span>
          </div>
          {quotaInfo.storage.limit !== -1 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(quotaInfo.storage)}`}
                style={{ width: `${Math.min(quotaInfo.storage.percentage, 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Projects */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Projects</span>
            <span className="text-sm font-medium">
              {getQuotaDisplay(quotaInfo.projects)}
            </span>
          </div>
          {quotaInfo.projects.limit !== -1 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(quotaInfo.projects)}`}
                style={{ width: `${Math.min(quotaInfo.projects.percentage, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {hasAnyExceeded && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          You've reached your plan limits. Consider upgrading.
        </div>
      )}
    </div>
  );
}