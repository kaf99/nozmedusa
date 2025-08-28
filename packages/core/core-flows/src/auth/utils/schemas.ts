import { z } from "zod"

/**
 * Algorithm types from jsonwebtoken
 */
const algorithmSchema = z.enum([
  "HS256", "HS384", "HS512",
  "RS256", "RS384", "RS512",
  "ES256", "ES384", "ES512",
  "PS256", "PS384", "PS512",
  "none"
])

/**
 * Schema for JWT Header matching jsonwebtoken JwtHeader
 */
const jwtHeaderSchema = z.object({
  alg: z.union([z.string(), algorithmSchema]),
  typ: z.string().optional(),
  cty: z.string().optional(),
  crit: z.array(z.string()).optional(),
  kid: z.string().optional(),
  jku: z.string().optional(),
  x5u: z.union([z.string(), z.array(z.string())]).optional(),
  'x5t#S256': z.string().optional(),
  x5t: z.string().optional(),
  x5c: z.union([z.string(), z.array(z.string())]).optional(),
})

/**
 * Schema for JWT Sign Options matching jsonwebtoken SignOptions
 */
const jwtOptionsSchema = z.object({
  algorithm: algorithmSchema.optional(),
  keyid: z.string().optional(),
  expiresIn: z.union([z.string(), z.number()]).optional(),
  notBefore: z.union([z.string(), z.number()]).optional(),
  audience: z.union([z.string(), z.array(z.string())]).optional(),
  subject: z.string().optional(),
  issuer: z.string().optional(),
  jwtid: z.string().optional(),
  mutatePayload: z.boolean().optional(),
  noTimestamp: z.boolean().optional(),
  header: jwtHeaderSchema.optional(),
  encoding: z.string().optional(),
})

/**
 * Schema for JWT Secret matching jsonwebtoken Secret type
 */
const jwtSecretSchema = z.union([
  z.string(),
  z.instanceof(Buffer),
  z.object({
    key: z.union([z.string(), z.instanceof(Buffer)]),
    passphrase: z.string(),
  }),
])

/**
 * Schema for GenerateResetPasswordTokenWorkflowInput
 */
export const generateResetPasswordTokenWorkflowInputSchema = z.object({
  /**
   * The entity ID (e.g., email) for the user requesting password reset
   */
  entityId: z.string(),

  /**
   * The actor type (e.g., "customer" or "user")
   */
  actorType: z.string(),

  /**
   * The authentication provider (e.g., "emailpass")
   */
  provider: z.string(),

  /**
   * The JWT secret used to sign the token
   */
  secret: jwtSecretSchema.optional(),

  /**
   * Optional JWT signing options
   */
  jwtOptions: jwtOptionsSchema.optional(),
})

/**
 * Schema for GenerateResetPasswordTokenWorkflowOutput
 */
export const generateResetPasswordTokenWorkflowOutputSchema = z.string()

// Type inference for workflow input/output types
export type GenerateResetPasswordTokenWorkflowInput = z.infer<
  typeof generateResetPasswordTokenWorkflowInputSchema
>
export type GenerateResetPasswordTokenWorkflowOutput = z.infer<
  typeof generateResetPasswordTokenWorkflowOutputSchema
>
