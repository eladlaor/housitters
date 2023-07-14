import { Availability } from '../../types/clientSide'
import { countDays } from '../../utils/dates'

export default function DateDisplayer({ startDate, endDate }: Availability) {
  const daysCount = countDays(startDate, endDate)

  return (
    <>
      {new Date(endDate).getFullYear() === 1970 ? 'Flexible Dates' : `${startDate} - ${endDate}`}
      {daysCount > 0 && (
        <>
          <br />
          {`total days: ${daysCount}`}
        </>
      )}
    </>
  )
}
