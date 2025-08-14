import { z } from 'zod';

export const categories = ["AC", "Plumbing", "Electrical", "Furniture", "Lift"] as const;
export type MaintenanceCategory = (typeof categories)[number];

export const priorities = ["Low", "Medium", "High"] as const;
export type MaintenancePriority = (typeof priorities)[number];

export const statuses = ["Submitted", "In Progress", "Resolved"] as const;
export type MaintenanceStatus = (typeof statuses)[number];

export const hostels = ["Amaravathi", "Podhigai", "Vaigai", "Thamirabarani", "Paalar", "Bhavani", "Kaveri"] as const;
export type HostelName = (typeof hostels)[number];

export type Urgency = "low" | "medium" | "high" | "critical" | null;

export interface MaintenanceRequest {
  id: string;
  hostelName: HostelName;
  roomNumber: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  description: string;
  status: MaintenanceStatus;
  createdDate: Date;
  imageUrl?: string;
  urgency: Urgency;
  isDuplicate?: boolean;
}

export const createRequestSchema = z.object({
  hostelName: z.enum(hostels),
  roomNumber: z.string().min(1, 'Room number is required.'),
  category: z.enum(categories),
  priority: z.enum(priorities),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
});

export type CreateRequestState = {
  message?: string;
  errors?: {
    hostelName?: string[];
    roomNumber?: string[];
    category?: string[];
    priority?: string[];
    description?: string[];
  };
  success: boolean;
};
