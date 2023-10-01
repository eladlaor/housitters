import { DatePickerSelection } from '../types/clientSide'

export function parseDateMultiRange(
  dateRange: string | null
): null | [{ startDate: string; endDate: string }] {
  if (!dateRange) {
    return null
  }

  let modifiedAvailability: any = []

  let startDate = dateRange.substring(2, 12)
  let endDate = dateRange.substring(13, 23)

  modifiedAvailability.push({
    startDate: startDate,
    endDate: endDate,
  })

  return modifiedAvailability
}

export function countDays(startDate: string | Date, endDate: string | Date): number {
  let beginning: Date
  let end: Date

  if (new Date(endDate).getFullYear() === 1970) {
    return 0
  }

  if (typeof startDate === 'string') {
    beginning = new Date(startDate)
    end = new Date(endDate)
  } else {
    beginning = startDate as Date
    end = endDate as Date
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000
  const timeDifference = Math.abs(beginning.getTime() - end.getTime())
  const daysDifference = Math.floor(timeDifference / millisecondsPerDay)

  return daysDifference
}

export function isRangeAnytime(dateRange: DatePickerSelection) {
  return !dateRange[0] || (dateRange[1] && dateRange[1].getFullYear() === 1970)
}
