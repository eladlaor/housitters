import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function Counter({
  itemToCount,
  incrementer,
  decrementer,
  icon,
  count,
}: {
  itemToCount: string
  incrementer: any
  decrementer: any
  icon: any
  count: number
}) {
  return (
    <div className="counter-container">
      <button
        onClick={(e) => {
          e.preventDefault()
          incrementer(itemToCount)
        }}
        style={{ color: 'blue' }}
      >
        +
      </button>
      <div>
        <FontAwesomeIcon icon={icon} /> {count}
      </div>
      <button
        onClick={(e) => {
          e.preventDefault()
          decrementer(itemToCount)
        }}
      >
        -
      </button>
    </div>
  )
}
