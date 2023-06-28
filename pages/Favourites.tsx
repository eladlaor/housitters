import Row from 'react-bootstrap/Row'
import { useSelector } from 'react-redux'
import { selectAllFavouriteUsers } from '../slices/favouritesSlice'

export default function Favourites() {
  const favouriteUsers = useSelector(selectAllFavouriteUsers)

  return (
    <div>
      wip
      {favouriteUsers.length === 0 ? (
        <h1>You've yet to mark favourites</h1>
      ) : (
        favouriteUsers.map((favUser, index) => <Row key={index}>{favUser.favouriteUserId}</Row>)
      )}
    </div>
  )
}
