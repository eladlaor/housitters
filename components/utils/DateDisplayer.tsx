import { countDays } from '../../utils/dates'

export default function DateDisplayer({
  startDate,
  endDate,
}: {
  startDate: string
  endDate: string
}) {
  const daysCount = countDays(startDate, endDate)

  return (
    <>
      {new Date(endDate).getFullYear() === 1970 ? 'Flexible Dates' : `${startDate} - ${endDate}`}
      {/*daysCount > 0 && (
        <>
          <br />
          {`(${daysCount} days)`}
        </>
      )*/}
    </>
  )
}
