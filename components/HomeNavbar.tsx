import { useUser } from '@supabase/auth-helpers-react'
import { useSelector } from 'react-redux'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import Picture from './Picture'
import { PageRoutes, SignOutElementTypes, UserType } from '../utils/constants'

import { selectAvatarUrlState, selectFirstNameState } from '../slices/userSlice'
import SignOut from './Auth/SignOut'
import UserSearcher from './UserSearcher'
import Inbox from './Inbox'
import Link from 'next/link'
import Image from 'next/image'

export default function HomeNavbar({ userType }: any) {
  const user = useUser()
  const avatarUrl = useSelector(selectAvatarUrlState)
  console.log(`user in HomeNavbar exists? ${user ? 'yes' : 'no'}`)

  return (
    <Navbar bg="dark" variant="dark">
      <Navbar.Brand
        className="mr-auto"
        href={
          userType === UserType.Landlord
            ? PageRoutes.LandlordRoutes.Home
            : PageRoutes.HousitterRoutes.Home
        }
      >
        <Image src="/images/logo.png" width="100" height="100" />
      </Navbar.Brand>
      <div className="navbar-items-wrapper">
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <NavDropdown
              title={
                <div>
                  {user && (
                    <Picture
                      isIntro={false}
                      uid={user.id}
                      url={avatarUrl}
                      email={user.email as string}
                      primaryUse={userType}
                      size={80}
                      width={80} // should persist dimensions of image upon upload
                      height={80}
                      disableUpload={true}
                      bucketName="avatars"
                      isAvatar={true}
                      promptMessage=""
                      isRounded={true}
                    />
                  )}
                </div>
              }
            >
              <NavDropdown.Item href="/Account">Edit Profile</NavDropdown.Item>
              <SignOut elementType={SignOutElementTypes.NavDropdownItem} />
            </NavDropdown>

            <div className="navbar-item-align-center">
              <Nav.Item>
                <Inbox />
              </Nav.Item>
              <Nav.Item>
                <UserSearcher />
              </Nav.Item>
              <Nav.Item>
                <Link href="/Favourites">
                  <a className="nav-link">My Favourites</a>
                </Link>
              </Nav.Item>
            </div>
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
  )
}
