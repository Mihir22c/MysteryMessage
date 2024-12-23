import { z } from 'zod'

export const usernameValidation = z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must not be more than 20 characters").
    regex(/^[a-zA-Z0-9_]*$/, "Username must contain only letters, numbers, and underscores")

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    // confirmPassword: z.string(),
})