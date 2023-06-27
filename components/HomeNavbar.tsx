import { useUser } from '@supabase/auth-helpers-react'
import { useSelector } from 'react-redux'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import Picture from './Picture'
import { SignOutElementTypes } from '../utils/constants'

import { selectAvatarUrlState, selectFirstNameState } from '../slices/userSlice'
import SignOut from './Auth/SignOut'
import UserSearcher from './UserSearcher'
import Inbox from './Inbox'
import Link from 'next/link'

export default function HomeNavbar({ userType, accountRoute }: any) {
  const user = useUser()
  const avatarUrl = useSelector(selectAvatarUrlState)
  const firstName = useSelector(selectFirstNameState)

  return (
    <Navbar bg="dark" variant="dark">
      <Navbar.Brand className="mr-auto" href="#">
        Housitters.com
      </Navbar.Brand>
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
                {firstName}
              </div>
            }
          >
            <NavDropdown.Item href={accountRoute}>Edit Profile</NavDropdown.Item>
            <NavDropdown.Item>
              <SignOut elementType={SignOutElementTypes.Link} />
            </NavDropdown.Item>
          </NavDropdown>
          <div className="inbox-navbar">
            <Inbox />
          </div>
          <UserSearcher />
          <Link href="/Favourites">
            <a className="nav-link">My Favourites</a>
          </Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}
