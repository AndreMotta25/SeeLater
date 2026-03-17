import { z } from 'zod'

export const enrichUrlSchema = z.object({
  url: z.string().url('Invalid URL format')
})

export type EnrichUrlInput = z.infer<typeof enrichUrlSchema>
