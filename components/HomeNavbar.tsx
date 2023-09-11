import { useSessionContext, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import { PageRoutes, SignOutElementTypes, UserType } from '../utils/constants'
import Inbox from './Inbox'
import Link from 'next/link'
import { Button, Container } from 'react-bootstrap'
import { getUrlFromSupabase } from '../utils/helpers'
import { useEffect, useState } from 'react'
import SignOut from './Auth/SignOut'
import { selectAvatarUrlState, selectPrimaryUseState, setPrimaryUse } from '../slices/userSlice'
interface Props {
  className?: string
}

export default function HomeNavbar({ className = '' }: Props) {
  const { isLoading, session } = useSessionContext() // why preferred using session and not user?
  const supabaseClient = useSupabaseClient()
  const avatarUrl = useSelector(selectAvatarUrlState)
  const userType = useSelector(selectPrimaryUseState)
  const dispatch = useDispatch()

  const router = useRouter()
  const classNames = className || ''
  const [profile, setProfile] = useState({ name: '', picture: '' })
  const [hasPost, setHasPost] = useState(false)
  useEffect(() => {
    if (!isLoading && session) {
      const asyncWrapper = async () => {
        const { error, data } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error) {
          console.log('failed querying profiles in HomeNavbar. Error: ' + error)
          debugger
          return
        }

        if (data) {
          setProfile({
            picture: getUrlFromSupabase(data.avatar_url, 'avatars'),
            name: data?.first_name,
          })
          dispatch(setPrimaryUse(data?.primary_use))
        }

        supabaseClient
          .from('posts')
          .select('*')
          .eq('landlord_id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setHasPost(true)
            else setHasPost(false)
          })
      }
      asyncWrapper()
    }
  }, [isLoading, session, avatarUrl])

  return (
    <Navbar bg="dark" variant="dark" className={classNames}>
      <Container>
        <Navbar.Brand href="/">
          <img src="/logo-white.svg" style={{ marginTop: '-7px', maxHeight: '28px' }} />
        </Navbar.Brand>
        <div className="navbar-items-wrapper">
          <Navbar.Collapse className="justify-content-between d-flex w-100">
            <Nav className="ml-auto">
              <Nav.Item>
                <Link
                  href={
                    session
                      ? PageRoutes.LandlordRoutes.Home
                      : `${PageRoutes.Intro}?userType=${UserType.Landlord}`
                  }
                >
                  <a className="nav-link">Sitters</a>
                </Link>
              </Nav.Item>
              <Nav.Item>
                <Link
                  href={
                    session
                      ? PageRoutes.HousitterRoutes.Home
                      : `${PageRoutes.Intro}?userType=${UserType.Housitter}`
                  }
                >
                  <a className="nav-link">Houses</a>
                </Link>
              </Nav.Item>
            </Nav>

            {session ? (
              <Nav>
                <Nav.Item>
                  <Inbox />
                </Nav.Item>
                <Nav.Item>
                  <Link href="/favourites">
                    <a className="nav-link">Favourites</a>
                  </Link>
                </Nav.Item>
                <Nav.Item>
                  <NavDropdown
                    align="end"
                    title={
                      <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <img
                          src={profile?.picture}
                          style={{
                            position: 'absolute',
                            width: 30,
                            height: 30,
                            borderRadius: 1000,
                          }}
                        />

                        <span style={{ paddingLeft: '40px' }}>{profile?.name}</span>
                      </div>
                    }
                  >
                    <NavDropdown.Item href={PageRoutes.Profile}>Edit Profile</NavDropdown.Item>
                    {userType === UserType.Landlord &&
                      (hasPost ? (
                        <NavDropdown.Item href={PageRoutes.HousitterRoutes.EditHouse}>
                          Edit House
                        </NavDropdown.Item>
                      ) : (
                        <NavDropdown.Item href={PageRoutes.HousitterRoutes.EditHouse}>
                          Add Your House
                        </NavDropdown.Item>
                      ))}
                    <SignOut elementType={SignOutElementTypes.NavDropdownItem} />
                  </NavDropdown>
                </Nav.Item>
              </Nav>
            ) : (
              <Nav>
                <Nav.Item>
                  <Link href="/about">
                    <a className="nav-link">About</a>
                  </Link>
                </Nav.Item>
                <Nav.Item>
                  <Button
                    className="ms-4 me-4"
                    onClick={() => {
                      router.push(PageRoutes.Auth.Login)
                    }}
                  >
                    Login
                  </Button>
                </Nav.Item>
                <Nav.Item>
                  <Button
                    variant="success"
                    onClick={() => router.push(PageRoutes.Auth.Signup)}
                    className="me-4"
                  >
                    Signup
                  </Button>
                </Nav.Item>
              </Nav>
            )}
          </Navbar.Collapse>
          <div className="navbar-item-align-center"></div>
        </div>
      </Container>
    </Navbar>
  )
}
