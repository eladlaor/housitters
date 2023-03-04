export default function Counter({
  itemToCount,
  incrementer,
  decrementer,
}: {
  itemToCount: string
  incrementer: any
  decrementer: any
}) {
  return (
    <div>
      <div>
        <button
          onClick={(e) => {
            e.preventDefault()
            incrementer(itemToCount)
          }}
        >
          +
        </button>
      </div>

      <div>
        <button
          onClick={(e) => {
            e.preventDefault()
            decrementer(itemToCount)
          }}
        >
          -
        </button>
      </div>
    </div>
  )
}
