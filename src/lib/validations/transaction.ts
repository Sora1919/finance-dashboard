import { z } from "zod";

export const transactionSchema = z.object({
    title: z.string().trim().min(1).max(120),
    amount: z
        .string()
        .trim()
        .regex(/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/, {
            message: "Enter a valid amount with up to two decimal places.",
        })
        .refine((value) => Number(value) > 0, {
            message: "Amount must be greater than zero.",
        }),
    type: z.enum(["income", "expense"]),
    category: z.string().trim().min(1).max(80),
    description: z.string().trim().max(500).optional(),
    date: z.iso.date(),
});