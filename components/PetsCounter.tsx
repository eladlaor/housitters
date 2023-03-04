import { useSelector, useDispatch } from 'react-redux'
import { selectPetsState, setPetsState } from '../slices/landlordSlice'
import Counter from '../components/ui/Counter'
import { Database } from '../types/supabase'

export default function PetsCounter() {
  const dispatch = useDispatch()
  const pets = useSelector(selectPetsState)

  const incrementPet = (petType: any) => {
    let modifiedPets = JSON.parse(JSON.stringify(pets))
    modifiedPets[petType] = modifiedPets[petType] + 1
    dispatch(setPetsState(modifiedPets))
  }

  const decrementPet = (petType: any) => {
    let modifiedPets = JSON.parse(JSON.stringify(pets))
    const petCount = modifiedPets[petType]
    if (petCount != 0) {
      modifiedPets[petType] = modifiedPets[petType] - 1
    }
    dispatch(setPetsState(modifiedPets))
  }

  return (
    <div>
      <div>
        <h3>Dogs: {pets['dogs']}</h3>
        <Counter itemToCount="dogs" incrementer={incrementPet} decrementer={decrementPet} />
      </div>
      <div>
        <h3>Cats: {pets['cats']}</h3>
        <Counter itemToCount="cats" incrementer={incrementPet} decrementer={decrementPet} />
      </div>
    </div>
  )
}
