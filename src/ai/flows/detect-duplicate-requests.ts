'use server';

/**
 * @fileOverview A duplicate maintenance request detection AI agent.
 *
 * - detectDuplicateRequests - A function that handles the duplicate request detection process.
 * - DetectDuplicateRequestsInput - The input type for the detectDuplicateRequests function.
 * - DetectDuplicateRequestsOutput - The return type for the detectDuplicateRequests function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectDuplicateRequestsInputSchema = z.object({
  requests: z.array(
    z.object({
      roomNumber: z.string().describe('The room number of the request.'),
      category: z.string().describe('The category of the maintenance request (e.g., AC, plumbing).'),
      priority: z.string().describe('The priority of the request (e.g., high, medium, low).'),
      description: z.string().describe('The description of the maintenance request.'),
      status: z.string().describe('The status of the request (e.g., submitted, in progress, resolved).'),
      createdDate: z.string().describe('The date the request was created.'),
    })
  ).describe('An array of maintenance requests to check for duplicates.'),
});
export type DetectDuplicateRequestsInput = z.infer<typeof DetectDuplicateRequestsInputSchema>;

const DetectDuplicateRequestsOutputSchema = z.object({
  duplicateGroups: z.array(
    z.array(
      z.number().describe('The index of the request in the input array that is a duplicate.')
    )
  ).describe('An array of arrays, where each inner array contains the indices of duplicate requests.'),
});
export type DetectDuplicateRequestsOutput = z.infer<typeof DetectDuplicateRequestsOutputSchema>;

export async function detectDuplicateRequests(input: DetectDuplicateRequestsInput): Promise<DetectDuplicateRequestsOutput> {
  return detectDuplicateRequestsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectDuplicateRequestsPrompt',
  input: {schema: DetectDuplicateRequestsInputSchema},
  output: {schema: DetectDuplicateRequestsOutputSchema},
  prompt: `You are an expert at identifying duplicate maintenance requests in a hostel.

  Given a list of maintenance requests, identify groups of requests that are likely duplicates.
  Requests are considered duplicates if they originate from the same room and describe similar issues.

  Return an array of arrays, where each inner array contains the indices of the duplicate requests in the input array.

  Here are the maintenance requests:
  {{#each requests}}
  Request {{@index}}:
    Room Number: {{this.roomNumber}}
    Category: {{this.category}}
    Priority: {{this.priority}}
    Description: {{this.description}}
    Status: {{this.status}}
    Created Date: {{this.createdDate}}
  {{/each}}`,
});

const detectDuplicateRequestsFlow = ai.defineFlow(
  {
    name: 'detectDuplicateRequestsFlow',
    inputSchema: DetectDuplicateRequestsInputSchema,
    outputSchema: DetectDuplicateRequestsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
