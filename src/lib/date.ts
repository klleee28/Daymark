import { addDays, format } from 'date-fns'

export const toDateKey = (date: Date) => format(date, 'yyyy-MM-dd')
export const todayKey = () => toDateKey(new Date())
export const dateFromToday = (days: number) => toDateKey(addDays(new Date(), days))
export const friendlyToday = () => format(new Date(), 'EEEE, MMMM d')
