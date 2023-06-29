import Row from 'react-bootstrap/Row'
import { useSelector } from 'react-redux'
import { selectAllFavouriteUsers } from '../slices/favouritesSlice'
import { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { Button, Card } from 'react-bootstrap'

import PublicProfile from '../components/PublicProfile'
import { Router, useRouter } from 'next/router'
import { selectPrimaryUseState } from '../slices/userSlice'
import { PageRoutes, USER_TYPE } from '../utils/constants'
import HomeNavbar from '../components/HomeNavbar'

export default function Favourites() {
  const supabaseClient = useSupabaseClient()
  const user = useUser()
  const favouriteUsers = useSelector(selectAllFavouriteUsers)
  const router = useRouter()
  const userType = useSelector(selectPrimaryUseState)

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
    <div className="h-100">
      <div className={favouriteUsers.length === 0 ? `position-absolute w-100` : ''}>
        <HomeNavbar userType={userType} />
      </div>
      <div className="d-flex align-items-center justify-content-center vh-100">
        {favouriteUsers.length === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center">
            <h2>You've yet to mark any favourites</h2>
            <Button
              onClick={() =>
                router.push(
                  userType === USER_TYPE.Landlord
                    ? PageRoutes.LandlordRoutes.Home
                    : PageRoutes.HousitterRoutes.Home
                )
              }
            >
              Back to Home
            </Button>
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
    </div>
  )
}
