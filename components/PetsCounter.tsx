import { useSelector, useDispatch } from 'react-redux'
import { selectPetsState, setPetsState } from '../slices/landlordSlice'
import Counter from './Counter'
import { Database } from '../types/supabase'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCat, faDog } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import { handleError } from '../utils/helpers'

export default function PetsCounter() {
  const dispatch = useDispatch()
  const pets = useSelector(selectPetsState)

  const user = useUser()
  const userId = user?.id
  const supabaseClient = useSupabaseClient()

  useEffect(() => {
    if (!userId) {
      return
    }

    const loadPets = async () => {
      const { error: landlordError, data: landlordData } = await supabaseClient
        .from('pets')
        .select('dogs, cats')
        .eq('user_id', userId)
        .single()

      if (landlordError) {
        return handleError(landlordError.message, 'getProfile')
      }

      if (landlordData) {
        const pets = {
          dogs: landlordData.dogs,
          cats: landlordData.cats,
        }

        console.log(pets.dogs)

        dispatch(setPetsState(pets))
      }
    }

    loadPets()
  }, [])

  const incrementPet = async (petType: string) => {
    let modifiedPets = JSON.parse(JSON.stringify(pets))
    modifiedPets[petType] = modifiedPets[petType] + 1

    dispatch(setPetsState(modifiedPets))
  }

  const decrementPet = async (petType: string) => {
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
