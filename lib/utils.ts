import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`
  }
  return `₹${(price / 1000).toFixed(0)}K`
}

export function formatPriceExact(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'
  let id = localStorage.getItem('bg_session')
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('bg_session', id)
  }
  return id
}
