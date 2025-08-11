'use server';
/**
 * @fileOverview Predicts the urgency of a maintenance request.
 *
 * - predictRequestUrgency - A function that predicts the urgency of a maintenance request.
 * - PredictRequestUrgencyInput - The input type for the predictRequestUrgency function.
 * - PredictRequestUrgencyOutput - The return type for the predictRequestUrgency function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictRequestUrgencyInputSchema = z.object({
  category: z
    .string()
    .describe("The category of the maintenance request (e.g., 'AC', 'plumbing', 'electrical', 'furniture')."),
  description: z.string().describe('A detailed description of the maintenance request.'),
});
export type PredictRequestUrgencyInput = z.infer<typeof PredictRequestUrgencyInputSchema>;

const PredictRequestUrgencyOutputSchema = z.object({
  urgency: z
    .string()
    .describe(
      "The predicted urgency of the maintenance request. Possible values: 'low', 'medium', 'high', 'critical'."
    ),
  reason: z.string().describe('The reason for the predicted urgency.'),
});
export type PredictRequestUrgencyOutput = z.infer<typeof PredictRequestUrgencyOutputSchema>;

export async function predictRequestUrgency(input: PredictRequestUrgencyInput): Promise<PredictRequestUrgencyOutput> {
  return predictRequestUrgencyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictRequestUrgencyPrompt',
  input: {schema: PredictRequestUrgencyInputSchema},
  output: {schema: PredictRequestUrgencyOutputSchema},
  prompt: `You are an AI assistant that predicts the urgency of maintenance requests based on their category and description.

  Prioritize safety-critical issues such as lift malfunctions trapping a person or electrical hazards.

  Analyze the request and determine its urgency level (low, medium, high, critical) and provide a brief reason for the assessment.

  Category: {{{category}}}
  Description: {{{description}}}
  `,
});

const predictRequestUrgencyFlow = ai.defineFlow(
  {
    name: 'predictRequestUrgencyFlow',
    inputSchema: PredictRequestUrgencyInputSchema,
    outputSchema: PredictRequestUrgencyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
