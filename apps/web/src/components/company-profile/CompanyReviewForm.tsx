'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Star } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { EmploymentStatus } from '@/generated/prisma';
import {
  createCompanyReviewSchema,
  type CreateCompanyReviewInput,
} from '@/lib/validations/company-review.validation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface CompanyReviewFormProps {
  companyId: string;
  companyName: string;
  open: boolean;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateCompanyReviewInput) => Promise<void>;
}

type CompanyReviewFormValues = z.input<typeof createCompanyReviewSchema>;

function buildDefaultValues(companyId: string): CompanyReviewFormValues {
  return {
    companyId,
    rating: 0,
    title: '',
    reviewText: '',
    pros: null,
    cons: null,
    workLifeBalanceRating: null,
    salaryBenefitRating: null,
    managementRating: null,
    cultureRating: null,
    isAnonymous: false,
    employmentStatus: EmploymentStatus.CURRENT,
    positionTitle: null,
    employmentLength: null,
  };
}

function normalizeOptionalText(value: string): string | null {
  return value.trim().length === 0 ? null : value;
}

function RatingInput({
  value,
  onChange,
  allowClear = false,
}: {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  allowClear?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {Array.from({ length: 5 }).map((_, idx) => {
        const ratingValue = idx + 1;
        const isActive = ratingValue <= (value ?? 0);

        return (
          <button
            key={ratingValue}
            type="button"
            onClick={() => {
              if (allowClear && value === ratingValue) {
                onChange(null);
                return;
              }

              onChange(ratingValue);
            }}
            className="rounded-full p-1 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
            aria-label={`Rate ${ratingValue} star${ratingValue > 1 ? 's' : ''}`}
          >
            <Star
              className={`h-6 w-6 ${
                isActive ? 'fill-violet-500 text-violet-500' : 'text-violet-200'
              }`}
            />
          </button>
        );
      })}

      {allowClear && (
        <span className="text-xs text-gray-500">Click the selected rating again to clear it.</span>
      )}
    </div>
  );
}

export function CompanyReviewForm({
  companyId,
  companyName,
  open,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: CompanyReviewFormProps) {
  const form = useForm<CompanyReviewFormValues, unknown, CreateCompanyReviewInput>({
    resolver: zodResolver(createCompanyReviewSchema),
    defaultValues: buildDefaultValues(companyId),
  });

  useEffect(() => {
    form.reset(buildDefaultValues(companyId));
  }, [companyId, form, open]);

  const handleSubmit = async (values: CreateCompanyReviewInput) => {
    await onSubmit({
      ...values,
      companyId,
    });
    form.reset(buildDefaultValues(companyId));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-900">
          Share your experience working at <span className="font-semibold">{companyName}</span>.
          Your review will be moderated before it appears publicly.
        </div>

        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overall Rating *</FormLabel>
              <FormControl>
                <RatingInput value={field.value} onChange={(value) => field.onChange(value ?? 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="employmentStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employment Status *</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as EmploymentStatus)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={EmploymentStatus.CURRENT}>Current Employee</SelectItem>
                    <SelectItem value={EmploymentStatus.FORMER}>Former Employee</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="positionTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Frontend Engineer"
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(normalizeOptionalText(event.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="employmentLength"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Employment Length</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. 2 years 6 months"
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(normalizeOptionalText(event.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Review Title *</FormLabel>
              <FormControl>
                <Input placeholder="Summarize your experience" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reviewText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed Review *</FormLabel>
              <FormControl>
                <Textarea
                  rows={6}
                  placeholder="Describe your experience, team, growth opportunities, and overall impression."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="pros"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pros</FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    placeholder="What worked well for you?"
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(normalizeOptionalText(event.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cons"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cons</FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    placeholder="What could be improved?"
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(normalizeOptionalText(event.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Category Ratings</h3>
            <p className="mt-1 text-xs text-gray-500">Optional, but helpful for other candidates.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="workLifeBalanceRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work-Life Balance</FormLabel>
                  <FormControl>
                    <RatingInput value={field.value} onChange={field.onChange} allowClear />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salaryBenefitRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary & Benefits</FormLabel>
                  <FormControl>
                    <RatingInput value={field.value} onChange={field.onChange} allowClear />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="managementRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Management</FormLabel>
                  <FormControl>
                    <RatingInput value={field.value} onChange={field.onChange} allowClear />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cultureRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Culture</FormLabel>
                  <FormControl>
                    <RatingInput value={field.value} onChange={field.onChange} allowClear />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="isAnonymous"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start gap-3 rounded-2xl border border-gray-200 px-4 py-3">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
              </FormControl>
              <div className="space-y-1">
                <FormLabel className="cursor-pointer">Submit as anonymous</FormLabel>
                <p className="text-sm text-gray-500">
                  Your identity will be hidden from the public review card.
                </p>
              </div>
            </FormItem>
          )}
        />

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" className="bg-violet-600 hover:bg-violet-700" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
