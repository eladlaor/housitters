import Row from 'react-bootstrap/Row'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useSelector } from 'react-redux'
import { selectAllFavouriteUsers } from '../slices/favouritesSlice'

export default function Favourites() {
  const favouriteUsers = useSelector(selectAllFavouriteUsers)

  return (
    <div>
      wip
      {favouriteUsers.map((favUser) => (
        <Row>{favUser.favouriteUserId}</Row>
      ))}
    </div>
  )
}
