import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { Database } from '../../types/supabase'
import { useEffect, useState } from 'react'
import { FaHeart } from 'react-icons/fa'
import Toast from 'react-bootstrap/Toast'
import { useDispatch, useSelector } from 'react-redux'
import {
  removeFavouriteUser,
  selectAllFavouriteUsers,
  setAllFavouriteUsers,
} from '../../slices/favouritesSlice'
import { DefaultFavouriteUser } from '../../utils/constants'
export default function AddToFavourites({
  favouriteUserId,
  favouriteUserType,
}: {
  favouriteUserType: string
  favouriteUserId: string
}) {
  const supabaseClient = useSupabaseClient()
  const user = useUser()
  const dispatch = useDispatch()

  const favouriteUsers = useSelector(selectAllFavouriteUsers)

  const [isFavourite, setIsFavourite] = useState(
    favouriteUsers.some((user) => user.favouriteUserId === favouriteUserId)
  )

  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    setIsFavourite(favouriteUsers.some((user) => user.favouriteUserId === favouriteUserId))
  }, [favouriteUsers, favouriteUserId])

  async function handleSelectedFavouriteUser() {
    // TODO: need to check if it's adding or removing

    const isRemoval = favouriteUsers.some((user) => user.favouriteUserId === favouriteUserId)
    if (isRemoval) {
      const { error } = await supabaseClient
        .from('favourites')
        .delete()
        .eq('favourite_user_id', favouriteUserId)
        .eq('marked_by_user_id', user!.id)

      if (error) {
        alert(`failed removing favourite user: ${error}`)
        debugger
        throw error
      } else {
        dispatch(removeFavouriteUser(favouriteUserId))
        setToastMessage('Removed from Favourites')
      }
    } else {
      const { error } = await supabaseClient.from('favourites').upsert({
        created_at: new Date().toISOString(),
        favourite_user_id: favouriteUserId,
        favourite_user_type: favouriteUserType,
        marked_by_user_id: user!.id,
      } as Partial<Database['public']['Tables']['favourites']['Row']>)

      if (error) {
        alert(`error upserting new favourite user`)
        debugger
        return
      }

      setIsFavourite(true)
      setToastMessage('Added to Favourites')

      const newFavouriteUser: typeof DefaultFavouriteUser = {
        favouriteUserType,
        favouriteUserId,
        markedByUserId: user!.id,
      }

      dispatch(setAllFavouriteUsers([...favouriteUsers, newFavouriteUser]))
    }

    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 1500)
  }

  return (
    <div className="add-to-favourites-icon">
      <FaHeart
        className={`heart-icon ${isFavourite ? 'favourited' : ''}`}
        onClick={handleSelectedFavouriteUser}
      >
        add to favourites
      </FaHeart>
      <div className="added-to-favourites-toast ">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={2000} autohide>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </div>
    </div>
  )
}
