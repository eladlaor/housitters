import Row from 'react-bootstrap/Row'
import { useSelector } from 'react-redux'
import { selectAllFavouriteUsers } from '../slices/favouritesSlice'
import { useEffect, useState } from 'react'
import { useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react'
import { Button, Card, Container } from 'react-bootstrap'

import AvailableHousitter from '../components/AvailableHousitter'
// import PublicProfile from '../components/PublicProfile'
import { Router, useRouter } from 'next/router'
import { selectPrimaryUseState } from '../slices/userSlice'
import { PageRoutes, UserType } from '../utils/constants'

export default function Favourites() {
  const supabaseClient = useSupabaseClient()
  const { session, isLoading } = useSessionContext()
  const userId = session?.user?.id
  const favouriteUsers = useSelector(selectAllFavouriteUsers)
  const router = useRouter()
  const userType = useSelector(selectPrimaryUseState)

  const [favouriteUsersDetails, setFavouriteUsersDetails] = useState([] as any)

  useEffect(() => {
    if (!isLoading && !userId) {
      router.push('/auth/login')
    }

    async function loadFavouriteUsers() {
      const favouriteUserIds = favouriteUsers.map((favUser) => favUser.favouriteUserId)

      const { error, data } = await supabaseClient
        .from('profiles')
        .select('first_name, last_name, avatar_url, id, primary_use, email')
        .in('id', favouriteUserIds)

      if (error) {
        console.log(`failed retrieving favourite users: ${error}`)
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
    <Container>
      <h1>Favourites</h1>
      {favouriteUsers.length === 0 ? (
        <div className="d-flex flex-column align-items-center justify-content-center">
          <h2>You've yet to mark any favourites</h2>
          <Button
            onClick={() =>
              router.push(
                userType === UserType.Landlord
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
          <AvailableHousitter
            housitterId={favUser.housitterId}
            firstName={favUser.firstName}
            lastName={favUser.lastName}
            experience={favUser.experience}
            aboutMeText={
              favUser.about_me
                ? favUser.about_me
                : `${favUser.firstName} didn't write a description yet`
            }
            avatarUrl={favUser.avatarUrl}
            key={index}
          />
        ))
      )}
    </Container>
  )
}
