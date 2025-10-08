import { z } from 'zod';

export const AnimalSchema = z.object({
  name: z.string().optional(),
  type: z.string().min(1, { message: "Animal type is required." }),
  breed: z.string().optional(),
  birth_date: z.string().optional(),
  gender: z.string().optional(),
  color: z.string().optional(),
  weight: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().positive({ message: "Weight must be a positive number." }).optional()
  ),
  notes: z.string().optional(),
});