'use client';

import { ONBOARDING_FLOWS, type OnboardingFlowId } from '@terrashaper/shared';
import { CheckCircle2, Circle, Lock } from 'lucide-react';
import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { onboardingFlows } from '@/lib/onboarding-flows';
import { cn } from '@/lib/utils';
import { useOnboardingStore } from '@/stores/onboarding';

type FlowProgress = {
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
              <div className="shrink-0">
                {flow.status === 'completed' ? (
                  <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
                ) : flow.status === 'locked' ? (
                  <Lock className="size-5 text-muted-foreground" />
                ) : (
                  <Circle className="size-5 text-muted-foreground" />
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="truncate font-medium">{flow.name}</h4>
                  {flow.status === 'completed' && (
                    <Badge variant="secondary" className="text-xs">
                      Completed
                    </Badge>
                  )}
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {flow.description}
                </p>
              </div>

              {/* Action */}
              <div className="shrink-0">
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
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              🎉 Congratulations! You've completed all tutorials!
            </p>
            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
              You're now ready to create amazing landscape designs.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}