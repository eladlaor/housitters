import { useSelector, useDispatch } from 'react-redux'
import { selectPetsState, setPetsState } from '../slices/landlordSlice'
import Counter from './Counter'
import { Database } from '../types/supabase'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCat, faDog } from '@fortawesome/free-solid-svg-icons'

export default function PetsCounter() {
  const dispatch = useDispatch()
  const pets = useSelector(selectPetsState)

  const incrementPet = async (petType: any) => {
    let modifiedPets = JSON.parse(JSON.stringify(pets))
    modifiedPets[petType] = modifiedPets[petType] + 1

    dispatch(setPetsState(modifiedPets))
  }

  const decrementPet = async (petType: any) => {
    let modifiedPets = JSON.parse(JSON.stringify(pets))
    const petCount = modifiedPets[petType]
    if (petCount != 0) {
      modifiedPets[petType] = modifiedPets[petType] - 1
    }

    dispatch(setPetsState(modifiedPets))
  }

  return (
    <div className="pets-counter-container">
      <Counter
        itemToCount="dogs"
        incrementer={incrementPet}
        decrementer={decrementPet}
        icon={faDog}
        count={pets['dogs']}
      />

      <Counter
        itemToCount="cats"
        incrementer={incrementPet}
        decrementer={decrementPet}
        icon={faCat}
        count={pets['cats']}
      />
    </div>
  )
}
