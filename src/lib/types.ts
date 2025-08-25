
import { z } from 'zod';

export const categories = ["AC", "Plumbing", "Electrical", "Furniture and Door", "Lift", "Water", "Water Dispenser"] as const;
export type MaintenanceCategory = (typeof categories)[number];

export const priorities = ["Low", "Medium", "High"] as const;
export type MaintenancePriority = (typeof priorities)[number];

export const statuses = ["Submitted", "Assigned", "In Progress", "Completed"] as const;
export type MaintenanceStatus = (typeof statuses)[number];

export const hostels = ["Amaravathi", "Podhigai", "Vaigai", "Thamirabarani", "Paalar", "Bhavani", "Kaveri"] as const;
export type HostelName = (typeof hostels)[number];

export const roles = ["admin", "user"] as const;
export type Role = (typeof roles)[number];


export type Urgency = "low" | "medium" | "high" | "critical" | null;

export interface MaintenanceRequest {
  id: string;
  name: string;
  registerNumber: string;
  hostelName: HostelName;
  floor: string;
  roomNumber: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  description: string;
  status: MaintenanceStatus;
  createdDate: string; // Changed to string to match server serialization
  imageUrl?: string;
  urgency: Urgency;
  isDuplicate?: boolean;
}

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});


export const createRequestSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  registerNumber: z.string().min(1, 'Register number is required.'),
  hostelName: z.enum(hostels, { required_error: 'Hostel name is required.' }),
  floor: z.string().min(1, 'Floor is required.'),
  roomNumber: z.string().min(1, 'Room number is required.'),
  category: z.enum(categories, { required_error: 'Category is required.' }),
  priority: z.enum(priorities, { required_error: 'Priority is required.' }),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  photo: z.any().optional(),
});

export type CreateRequestState = {
  message?: string;
  errors?: {
    name?: string[];
    registerNumber?: string[];
    hostelName?: string[];
    floor?: string[];
    roomNumber?: string[];
    category?: string[];
    priority?: string[];
    description?: string[];
    photo?: string[];
  };
  success: boolean;
};
