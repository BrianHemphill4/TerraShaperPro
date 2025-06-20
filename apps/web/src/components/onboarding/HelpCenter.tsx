'use client';

import { useState } from 'react';
import { HelpCircle, BookOpen, Play, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { OnboardingProgress } from './OnboardingProgress';
import { SampleProjectsGallery } from './SampleProjectsGallery';
import { useOnboardingStore } from '@/stores/onboarding';
import { ONBOARDING_FLOWS } from '@terrashaper/shared';

export function HelpCenter() {
  const [open, setOpen] = useState(false);
  const { preferences, updatePreferences, startFlow } = useOnboardingStore();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 right-4 rounded-full shadow-lg bg-background hover:bg-accent z-50"
          aria-label="Open help center"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Help & Learning Center</SheetTitle>
          <SheetDescription>
            Get help, learn new features, and improve your skills
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="tutorials" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
            <TabsTrigger value="samples">Samples</TabsTrigger>
            <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="tutorials" className="space-y-4">
            <OnboardingProgress />
            
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="grid gap-2">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => {
                    startFlow(ONBOARDING_FLOWS.DESIGN_CANVAS_INTRO);
                    setOpen(false);
                  }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Replay Canvas Tutorial
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => {
                    startFlow(ONBOARDING_FLOWS.DRAWING_TOOLS);
                    setOpen(false);
                  }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Learn Drawing Tools
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="samples" className="mt-6">
            <SampleProjectsGallery />
          </TabsContent>

          <TabsContent value="shortcuts" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Tool Shortcuts</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between py-1">
                    <span>Select Tool</span>
                    <kbd className="px-2 py-0.5 text-xs bg-muted rounded">S</kbd>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Polygon Tool</span>
                    <kbd className="px-2 py-0.5 text-xs bg-muted rounded">P</kbd>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Area Tool</span>
                    <kbd className="px-2 py-0.5 text-xs bg-muted rounded">A</kbd>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Line Tool</span>
                    <kbd className="px-2 py-0.5 text-xs bg-muted rounded">L</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Edit Shortcuts</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between py-1">
                    <span>Copy</span>
                    <kbd className="px-2 py-0.5 text-xs bg-muted rounded">⌘/Ctrl + C</kbd>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Paste</span>
                    <kbd className="px-2 py-0.5 text-xs bg-muted rounded">⌘/Ctrl + V</kbd>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Cut</span>
                    <kbd className="px-2 py-0.5 text-xs bg-muted rounded">⌘/Ctrl + X</kbd>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Select All</span>
                    <kbd className="px-2 py-0.5 text-xs bg-muted rounded">⌘/Ctrl + A</kbd>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Delete</span>
                    <kbd className="px-2 py-0.5 text-xs bg-muted rounded">Delete/Backspace</kbd>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Undo</span>
                    <kbd className="px-2 py-0.5 text-xs bg-muted rounded">⌘/Ctrl + Z</kbd>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Redo</span>
                    <kbd className="px-2 py-0.5 text-xs bg-muted rounded">⌘/Ctrl + Shift + Z</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Object Shortcuts</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between py-1">
                    <span>Group</span>
                    <kbd className="px-2 py-0.5 text-xs bg-muted rounded">⌘/Ctrl + G</kbd>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Ungroup</span>
                    <kbd className="px-2 py-0.5 text-xs bg-muted rounded">⌘/Ctrl + U</kbd>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Cancel Operation</span>
                    <kbd className="px-2 py-0.5 text-xs bg-muted rounded">Escape</kbd>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-tooltips">Show Tooltips</Label>
                  <p className="text-sm text-muted-foreground">
                    Display helpful tooltips when hovering over interface elements
                  </p>
                </div>
                <Switch
                  id="show-tooltips"
                  checked={preferences.showTooltips}
                  onCheckedChange={(checked) => 
                    updatePreferences({ showTooltips: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-shortcuts">Show Keyboard Shortcuts</Label>
                  <p className="text-sm text-muted-foreground">
                    Display keyboard shortcuts in tooltips and menus
                  </p>
                </div>
                <Switch
                  id="show-shortcuts"
                  checked={preferences.showKeyboardShortcuts}
                  onCheckedChange={(checked) => 
                    updatePreferences({ showKeyboardShortcuts: checked })
                  }
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}