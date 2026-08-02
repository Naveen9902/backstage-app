import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["USER", "WORKER", "MANAGER"]),
  skill: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});

export const eventCreationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  location: z.string().min(3, "Location is required"),
  startTime: z.string().optional(),
  coverImageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  attendeeCategory: z.string().optional(),
  tags: z.string().optional(),
  language: z.string().optional(),
  duration: z.string().optional(),
  bands: z.string().optional(),
  artistAvatarUrl: z.string().optional(),
  socialLink: z.string().optional(),
  roles: z.array(z.object({
    name: z.string(),
    quantity: z.number().min(1),
    payRate: z.number().min(0),
    payType: z.enum(["HOURLY", "FIXED"]).default("HOURLY"),
    tier: z.string().optional(),
    questions: z.array(z.string()).optional()
  })).optional()
});

export const applicationSchema = z.object({
  staffingRequestId: z.string().uuid("Invalid staffing request ID"),
  answers: z.array(z.string()).optional()
});
