import api from '@/services/api'

interface NotificationSchedule {
  id: number
  message: string
  send_time: string // "HH:MM:SS" ou "HH:MM"
  frequency: 'once' | 'daily' | 'weekly'
  days_of_week: number[] | null
  send_date: string | null
  is_active: boolean
}

let timers: number[] = []

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}

function fireNotification(message: string) {
  if (Notification.permission === 'granted') {
    new Notification('Notre Histoire', { body: message, icon: '/favicon.ico' })
  }
}

function msUntilNextOccurrence(schedule: NotificationSchedule): number | null {
  const [h, m] = schedule.send_time.split(':').map(Number)
  const now = new Date()

  if (schedule.frequency === 'once') {
    if (!schedule.send_date) return null
    const target = new Date(`${schedule.send_date}T00:00:00`)
    target.setHours(h, m, 0, 0)
    const diff = target.getTime() - now.getTime()
    return diff > 0 ? diff : null
  }

  if (schedule.frequency === 'daily') {
    const target = new Date()
    target.setHours(h, m, 0, 0)
    if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1)
    return target.getTime() - now.getTime()
  }

  if (schedule.frequency === 'weekly') {
    if (!schedule.days_of_week?.length) return null
    let best: number | null = null
    for (const day of schedule.days_of_week) {
      const target = new Date()
      const currentDay = target.getDay() === 0 ? 7 : target.getDay() // 1=lundi..7=dimanche
      let diffDays = day - currentDay
      if (diffDays < 0) diffDays += 7
      target.setDate(target.getDate() + diffDays)
      target.setHours(h, m, 0, 0)
      if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 7)
      const diff = target.getTime() - now.getTime()
      if (best === null || diff < best) best = diff
    }
    return best
  }

  return null
}

export async function initScheduledNotifications() {
  timers.forEach((t) => clearTimeout(t))
  timers = []

  const granted = await requestNotificationPermission()
  if (!granted) return

  const { data } = await api.get<NotificationSchedule[]>('/notification-schedules')

  for (const schedule of data) {
    if (!schedule.is_active) continue
    const delay = msUntilNextOccurrence(schedule)
    if (delay === null) continue

    const id = window.setTimeout(() => {
      fireNotification(schedule.message)
      // Reprogramme pour daily/weekly une fois envoyée
      if (schedule.frequency !== 'once') initScheduledNotifications()
    }, delay)
    timers.push(id)
  }
}