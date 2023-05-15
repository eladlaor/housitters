export function parseDateMultiRange(
  dateRange: string | null
): null | [{ startDate: string; endDate: string }] {
  // TODO: type it with a name

  // maybe regex
  // does dateRange hold the same reference of the original obj ?

  if (!dateRange) {
    return null
  }

  let modifiedAvailability: any = [] // TODO: change 'any' to the named availability type

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
