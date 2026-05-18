import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '0.00'
  
  const num = typeof val === 'string' ? parseFloat(val.replace(/[^\d.-]/g, '')) : val
  if (isNaN(num)) return String(val)
  
  const parts = num.toFixed(2).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return parts.join('.')
}

export function formatNumber(val: number | string | undefined | null): string {
  if (val === undefined || val === null) return '0'
  const num = typeof val === 'string' ? parseFloat(val.replace(/[^\d.-]/g, '')) : val
  if (isNaN(num)) return String(val)
  
  const parts = num.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return parts.join('.')
}


export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) {
    const s = String(date)
    if (s.includes('T')) return s.split('T')[0].split('-').reverse().join('/')
    return s
  }
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}