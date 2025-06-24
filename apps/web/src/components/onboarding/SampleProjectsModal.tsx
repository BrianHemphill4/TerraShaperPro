'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { SampleProjectsGallery } from './SampleProjectsGallery';

type SampleProjectsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SampleProjectsModal({ open, onOpenChange }: SampleProjectsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
        </DialogHeader>
        <SampleProjectsGallery />
      </DialogContent>
    </Dialog>
  );
}
