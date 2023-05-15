import { useSelector, useDispatch } from 'react-redux'
import { selectPetsState, setPetsState } from '../slices/landlordSlice'
import Counter from './Counter'
import { Database } from '../types/supabase'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'

export default function PetsCounter() {
  const dispatch = useDispatch()
  const pets = useSelector(selectPetsState)
  const supabaseClient = useSupabaseClient()
  const user = useUser()

  // as they are both async, should make sure no race condition on quick press.

  // how can i make sure 'user' will never be undefined

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
