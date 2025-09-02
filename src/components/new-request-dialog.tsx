'use client';

import { useTransition, useEffect, useMemo } from 'react';
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
import { categories, createRequestSchema, maleHostels, femaleHostels } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

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
      gender: undefined,
      hostelName: undefined,
      floor: '',
      roomNumber: '',
      category: undefined,
      priority: 'Low',
      description: '',
      photo: undefined,
    },
  });

  const watchedGender = form.watch('gender');
  const watchedHostel = form.watch('hostelName');
  const watchedFloor = form.watch('floor');
  const watchedCategory = form.watch('category');

  const availableHostels = watchedGender === 'Male' ? maleHostels : watchedGender === 'Female' ? femaleHostels : [];
  
  const availableCategories = useMemo(() => {
    const floorNumber = parseInt(watchedFloor, 10);
    const isNumericFloor = !isNaN(floorNumber);
    const floorStr = watchedFloor.toLowerCase();

    let hasAC = false;
    if (watchedHostel === 'Vaigai') {
      hasAC = true;
    } else if (watchedHostel === 'Amaravathi') {
      const validFloors = ['g', '0', '1', '2', '3'];
      if (validFloors.includes(floorStr) || (isNumericFloor && floorNumber >= 0 && floorNumber <= 3)) {
        hasAC = true;
      }
    } else if (watchedHostel === 'Bhavani') {
        const validFloors = ['g', '0', '1', '2', '3', '4', '5', '6', '7'];
        if (validFloors.includes(floorStr) || (isNumericFloor && floorNumber >= 0 && floorNumber <= 7)) {
            hasAC = true;
        }
    }

    if (hasAC) {
      return categories;
    }
    return categories.filter(c => c !== 'AC');
  }, [watchedHostel, watchedFloor]);


  useEffect(() => {
    // Reset hostel when gender changes
    form.setValue('hostelName', undefined);
  }, [watchedGender, form]);

  useEffect(() => {
    // If AC is not in the available categories, and it was the selected category, reset it.
    if (watchedCategory === 'AC' && !availableCategories.includes('AC')) {
        form.setValue('category', undefined);
    }
  }, [availableCategories, watchedCategory, form]);


  const onSubmit = (values: z.infer<typeof createRequestSchema>) => {
    startTransition(async () => {
      const formData = new FormData();
      // Append all validated form values to formData
      for (const key in values) {
          if (key !== 'photo' && values[key as keyof typeof values] !== undefined) {
              formData.append(key, values[key as keyof typeof values] as string);
          }
      }
      
      const photoFile = values.photo?.[0];

      const submitRequest = async (photoDataUri?: string) => {
        if (photoDataUri) {
          formData.append('photoDataUri', photoDataUri);
        }

        try {
          const result = await createRequest(null, formData);

          if (result?.success) {
            toast({
              title: 'Success',
              description: result.message || 'Request submitted successfully.',
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
          console.error('Submission failed:', error);
          toast({
            title: 'Submission Failed',
            description: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
            variant: 'destructive',
          });
        }
      };

      if (photoFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          await submitRequest(reader.result as string);
        };
        reader.onerror = () => {
           toast({
                title: 'Error Reading File',
                description: 'There was an issue reading the uploaded photo.',
                variant: 'destructive',
            });
        }
        reader.readAsDataURL(photoFile);
      } else {
        await submitRequest();
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
                name="gender"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Male" />
                          </FormControl>
                          <FormLabel className="font-normal">Male</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Female" />
                          </FormControl>
                          <FormLabel className="font-normal">Female</FormLabel>
                        </FormItem>
                      </RadioGroup>
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
                    <Select onValueChange={field.onChange} value={field.value} disabled={!watchedGender}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={!watchedGender ? "Select gender first" : "Select a hostel"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableHostels.map((h) => (
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
                        {availableCategories.map((c) => (
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
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
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
