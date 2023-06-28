import Row from 'react-bootstrap/Row'
import { useSelector } from 'react-redux'
import { selectAllFavouriteUsers } from '../slices/favouritesSlice'
import { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { Card } from 'react-bootstrap'

import PublicProfile from '../components/PublicProfile'

export default function Favourites() {
  const supabaseClient = useSupabaseClient()
  const user = useUser()
  const favouriteUsers = useSelector(selectAllFavouriteUsers)

  const [favouriteUsersDetails, setFavouriteUsersDetails] = useState([] as any)

  console.log(favouriteUsers)
  useEffect(() => {
    if (!user) {
      return
    }

    async function loadFavouriteUsers() {
      const favouriteUserIds = favouriteUsers.map((favUser) => favUser.favouriteUserId)

      const { error, data } = await supabaseClient
        .from('profiles')
        .select('first_name, last_name, avatar_url, id, primary_use, email')
        .in('id', favouriteUserIds)

      if (error) {
        alert(`failed retrieving favourite users: ${error}`)
        debugger
        return
      }

      if (data) {
        let parsedFavouriteUsers: any = []
        for (const favUser of data) {
          parsedFavouriteUsers.push({
            firstName: favUser.first_name,
            lastName: favUser.last_name,
            avatarUrl: favUser.avatar_url,
            userId: favUser.id,
            userType: favUser.primary_use,
            email: favUser.email,
          })
        }

        setFavouriteUsersDetails(parsedFavouriteUsers)
      }
    }

    loadFavouriteUsers()
  }, [favouriteUsers])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {favouriteUsers.length === 0 ? (
        <div>
          <h1>You've yet to mark any favourites</h1>
          <h1>check out that heart icon on the top right of each one</h1>
        </div>
      ) : (
        favouriteUsersDetails.map((favUser: any, index: number) => (
          <Row key={index} className="mb-3">
            <Card bg="primary" style={{ width: '18rem' }}>
              <div className="center-element make-column">
                <Card.Body>
                  <PublicProfile
                    userId={favUser.userId}
                    primaryUse={favUser.UserType}
                    firstName={favUser.firstName}
                    lastName={favUser.lastName}
                    email={favUser.email}
                    aboutMe={favUser.aboutMe ? favUser.aboutMe : null}
                    avatarUrl={favUser.avatarUrl}
                  />
                </Card.Body>
              </div>
            </Card>
          </Row>
        ))
      )}
    </div>
  )
}
