'use client';

import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { useToast } from '@/hooks/use-toast';
import { createRequest } from '@/app/login/actions';
import { categories, createRequestSchema, hostels, MaintenanceCategory } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';

interface NewRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewRequestDialog({ open, onOpenChange }: NewRequestDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  const form = useForm<z.infer<typeof createRequestSchema>>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      name: '',
      registerNumber: '',
      hostelName: undefined,
      floor: '',
      roomNumber: '',
      category: undefined,
      priority: 'Low',
      description: '',
      photo: undefined,
    },
  });

  const watchedCategory = form.watch('category');

  useEffect(() => {
    if (watchedCategory) {
      const highPriorityCategories: MaintenanceCategory[] = ["Electrical", "Lift", "Water"];
      if (highPriorityCategories.includes(watchedCategory)) {
        form.setValue('priority', 'High');
      } else {
        form.setValue('priority', 'Low');
      }
    }
  }, [watchedCategory, form]);

  const onSubmit = (values: z.infer<typeof createRequestSchema>) => {
    startTransition(async () => {
      const formData = new FormData();
      // Append all form values to formData
      for (const key in values) {
          if (key !== 'photo') {
             formData.append(key, (values as any)[key]);
          }
      }

      // Handle file upload
      const photoFile = values.photo?.[0];
      if (photoFile) {
        // Convert file to data URI
        const reader = new FileReader();
        reader.onloadend = async () => {
            const photoDataUri = reader.result as string;
            formData.append('photoDataUri', photoDataUri);

            // Submit after file is read
            try {
                const result = await createRequest(null, formData);
                if (result?.success) {
                  toast({
                    title: 'Success',
                    description: "Request submitted successfully.",
                    variant: 'default',
                  });
                  onOpenChange(false);
                  form.reset();
                } else {
                  toast({
                    title: 'Error',
                    description: result?.message || 'An unexpected error occurred.',
                    variant: 'destructive',
                  });
                }
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to submit the request. Please try again.',
                    variant: 'destructive',
                });
            }
        };
        reader.readAsDataURL(photoFile);
      } else {
        // Submit without a photo
        try {
            const result = await createRequest(null, formData);
            if (result?.success) {
              toast({
                title: 'Success',
                description: "Request submitted successfully.",
                variant: 'default',
              });
              onOpenChange(false);
              form.reset();
            } else {
              toast({
                title: 'Error',
                description: result?.message || 'An unexpected error occurred.',
                variant: 'destructive',
              });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to submit the request. Please try again.',
                variant: 'destructive',
            });
        }
      }
    });
  };

  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
        form.reset();
    }
    onOpenChange(isOpen);
  }
  
  const photoRef = form.register('photo');

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Maintenance Request</DialogTitle>
          <DialogDescription>
            Fill in the details below to submit a new request. Click submit when you're done.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="registerNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Register Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your register number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hostelName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hostel Name</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a hostel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {hostels.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Floor</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1, 2, G" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="roomNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the issue in detail"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Hidden priority field */}
              <input type="hidden" {...form.register('priority')} />
               <FormField
                control={form.control}
                name="photo"
                render={() => (
                    <FormItem>
                        <FormLabel>Photo (Optional)</FormLabel>
                        <FormControl>
                            <Input type="file" {...photoRef} accept="image/*" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
               />

              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Submitting...' : 'Submit Request'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
