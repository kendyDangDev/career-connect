'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { CreateCompanyReviewInput } from '@/lib/validations/company-review.validation';
import { CompanyReviewForm } from './CompanyReviewForm';

interface CompanyReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName: string;
  isSubmitting?: boolean;
  onSubmit: (values: CreateCompanyReviewInput) => Promise<void>;
}

export function CompanyReviewDialog({
  open,
  onOpenChange,
  companyId,
  companyName,
  isSubmitting = false,
  onSubmit,
}: CompanyReviewDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && isSubmitting) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience at {companyName}. Your review will be reviewed before it appears
            publicly.
          </DialogDescription>
        </DialogHeader>

        <CompanyReviewForm
          companyId={companyId}
          companyName={companyName}
          open={open}
          isSubmitting={isSubmitting}
          onCancel={() => {
            if (isSubmitting) return;
            onOpenChange(false);
          }}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
