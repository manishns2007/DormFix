'use server';

import { revalidatePath } from 'next/cache';
import { addRequest } from '@/lib/data';
import { predictRequestUrgency } from '@/ai/flows/predict-request-urgency';
import { createRequestSchema, type CreateRequestState } from '@/lib/types';


export async function createRequest(
  prevState: CreateRequestState,
  formData: FormData
): Promise<CreateRequestState> {
  const validatedFields = createRequestSchema.safeParse({
    roomNumber: formData.get('roomNumber'),
    category: formData.get('category'),
    priority: formData.get('priority'),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check the fields.',
      success: false,
    };
  }
  
  const { category, description } = validatedFields.data;

  try {
    const { urgency } = await predictRequestUrgency({ category, description });

    await addRequest({
      ...validatedFields.data,
      status: 'Submitted',
      urgency,
      // In a real app, you would handle image upload and get a URL here.
      imageUrl: formData.get('photo') ? 'https://placehold.co/400x300.png' : undefined,
    });
    
    revalidatePath('/');
    return { message: `Request submitted successfully. Predicted urgency: ${urgency}.`, success: true };

  } catch (error) {
    console.error('Error creating request:', error);
    return { message: 'An error occurred while creating the request.', success: false };
  }
}
