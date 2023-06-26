import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { Database } from '../../types/supabase'
import { useState } from 'react'
import { FaHeart } from 'react-icons/fa'
import Toast from 'react-bootstrap/Toast'
import { useSelector } from 'react-redux'
import { selectAllFavouriteUsers } from '../../slices/favouritesSlice'
export default function AddToFavourites({
  favouriteUserId,
  favouriteUserType,
}: {
  favouriteUserType: string
  favouriteUserId: string
}) {
  const supabaseClient = useSupabaseClient()
  const user = useUser()

  const favouriteUsers = useSelector(selectAllFavouriteUsers)

  const [isFavourite, setIsFavourite] = useState(
    favouriteUsers.find((user) => user.favouriteUserId === favouriteUserId) ? true : false
  )
  const [showToast, setShowToast] = useState(false)

  async function handleSelectedFavouriteUser() {
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
          <Toast.Body>Added to favourites</Toast.Body>
        </Toast>
      </div>
    </div>
  )
}
