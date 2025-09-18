import z from "zod"
export const pricingContextResult = z.record(z.string(), z.any()).optional()
export const shippingOptionsContextResult = z.record(z.string(), z.any()).optional()
