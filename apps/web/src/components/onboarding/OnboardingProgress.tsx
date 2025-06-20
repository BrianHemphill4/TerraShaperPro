'use client';

import { useMemo } from 'react';
import { CheckCircle2, Circle, Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOnboardingStore } from '@/stores/onboarding';
import { onboardingFlows } from '@/lib/onboarding-flows';
import { ONBOARDING_FLOWS, type OnboardingFlowId } from '@terrashaper/shared';
import { cn } from '@/lib/utils';

interface FlowProgress {
  flowId: OnboardingFlowId;
  name: string;
  description: string;
  status: 'completed' | 'available' | 'locked';
  prerequisite?: OnboardingFlowId;
}

const flowOrder: OnboardingFlowId[] = [
  ONBOARDING_FLOWS.INITIAL_SETUP,
  ONBOARDING_FLOWS.DASHBOARD_TOUR,
  ONBOARDING_FLOWS.DESIGN_CANVAS_INTRO,
  ONBOARDING_FLOWS.DRAWING_TOOLS,
  ONBOARDING_FLOWS.PLANT_LIBRARY,
  ONBOARDING_FLOWS.LAYERS_AND_PROPERTIES,
  ONBOARDING_FLOWS.EXPORT_AND_SHARE,
];

const flowPrerequisites: Partial<Record<OnboardingFlowId, OnboardingFlowId>> = {
  [ONBOARDING_FLOWS.DASHBOARD_TOUR]: ONBOARDING_FLOWS.INITIAL_SETUP,
  [ONBOARDING_FLOWS.DESIGN_CANVAS_INTRO]: ONBOARDING_FLOWS.INITIAL_SETUP,
  [ONBOARDING_FLOWS.DRAWING_TOOLS]: ONBOARDING_FLOWS.DESIGN_CANVAS_INTRO,
  [ONBOARDING_FLOWS.PLANT_LIBRARY]: ONBOARDING_FLOWS.DRAWING_TOOLS,
  [ONBOARDING_FLOWS.LAYERS_AND_PROPERTIES]: ONBOARDING_FLOWS.DRAWING_TOOLS,
  [ONBOARDING_FLOWS.EXPORT_AND_SHARE]: ONBOARDING_FLOWS.DRAWING_TOOLS,
};

export function OnboardingProgress() {
  const { completedFlows, skippedFlows, isFlowCompleted, startFlow, resetFlow } = useOnboardingStore();

  const flowProgress = useMemo<FlowProgress[]>(() => {
    return flowOrder.map((flowId) => {
      const flow = onboardingFlows[flowId];
      const prerequisite = flowPrerequisites[flowId];
      
      let status: FlowProgress['status'] = 'available';
      
      if (completedFlows.includes(flowId)) {
        status = 'completed';
      } else if (prerequisite && !isFlowCompleted(prerequisite)) {
        status = 'locked';
      }

      return {
        flowId,
        name: flow.name,
        description: flow.description,
        status,
        prerequisite,
      };
    });
  }, [completedFlows, isFlowCompleted]);

  const overallProgress = useMemo(() => {
    const total = flowOrder.length;
    const completed = completedFlows.length;
    return Math.round((completed / total) * 100);
  }, [completedFlows]);

  const handleStartFlow = (flowId: OnboardingFlowId) => {
    startFlow(flowId);
  };

  const handleResetFlow = (flowId: OnboardingFlowId) => {
    resetFlow(flowId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Learning Progress</CardTitle>
        <CardDescription>
          Complete these tutorials to master TerraShaperPro
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="text-muted-foreground">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Individual Flows */}
        <div className="space-y-3">
          {flowProgress.map((flow) => (
            <div
              key={flow.flowId}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                flow.status === 'completed' && 'bg-muted/50',
                flow.status === 'locked' && 'opacity-60'
              )}
            >
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {flow.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : flow.status === 'locked' ? (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium truncate">{flow.name}</h4>
                  {flow.status === 'completed' && (
                    <Badge variant="secondary" className="text-xs">
                      Completed
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {flow.description}
                </p>
              </div>

              {/* Action */}
              <div className="flex-shrink-0">
                {flow.status === 'completed' ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResetFlow(flow.flowId)}
                  >
                    Replay
                  </Button>
                ) : flow.status === 'available' ? (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleStartFlow(flow.flowId)}
                  >
                    Start
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" disabled>
                    Locked
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Achievement Message */}
        {overallProgress === 100 && (
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              🎉 Congratulations! You've completed all tutorials!
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              You're now ready to create amazing landscape designs.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}