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
