import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SECONDS = 1000
const MINUTES = 60 * SECONDS
const HOURS = 60 * MINUTES
const DAYS = 24 * HOURS
const WEEKS = 7 * DAYS
const MONTHS = 30 * DAYS

export function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp

  if (diff < MINUTES) return 'agora'
  if (diff < HOURS) return `${Math.floor(diff / MINUTES)} min atrás`
  if (diff < DAYS) return `${Math.floor(diff / HOURS)}h atrás`
  if (diff < WEEKS) return `${Math.floor(diff / DAYS)}d atrás`
  if (diff < MONTHS) return `${Math.floor(diff / WEEKS)} semana${Math.floor(diff / WEEKS) > 1 ? 's' : ''} atrás`
  return `${Math.floor(diff / MONTHS)} mês${Math.floor(diff / MONTHS) > 1 ? 'es' : ''} atrás`
}
