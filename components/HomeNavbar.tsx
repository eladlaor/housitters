import { useSessionContext, useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
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
import { selectPrimaryUseState, setPrimaryUse } from '../slices/userSlice'
import { useTranslation } from 'react-i18next'
import 'flag-icon-css/css/flag-icons.min.css'

interface Props {
  className?: string
}

export default function HomeNavbar({ className = '' }: Props) {
  const { isLoading } = useSessionContext()
  const supabaseClient = useSupabaseClient()
  const user = useUser()
  const userId = user?.id
  const userType = useSelector(selectPrimaryUseState)
  const dispatch = useDispatch()

  const router = useRouter()
  const currentLocale = router.locale
  const classNames = className || ''
  const [profile, setProfile] = useState({ name: '', picture: '' })
  const [hasPost, setHasPost] = useState(false)
  const { t, i18n } = useTranslation()

  useEffect(() => {
    if (!isLoading && userId) {
      const asyncWrapper = async () => {
        const { error, data } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', userId)
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

        if (userType === UserType.Landlord) {
          supabaseClient
            .from('posts')
            .select('*')
            .eq('landlord_id', userId)
            .single()
            .then(({ data }) => {
              if (data) setHasPost(true)
              else setHasPost(false)
            })
        }
      }
      asyncWrapper()
    }
  }, [isLoading, userId])

  function handleLocaleChange(locale: string) {
    i18n.changeLanguage(locale)
    router.push(
      {
        pathname: router.pathname,
        query: router.query,
      },
      undefined,
      { locale }
    )
  }

  return (
    <Navbar bg="dark" variant="dark" className={classNames}>
      <Container>
        <Navbar.Brand href="/">
          <img src="images/white-housitters-logo.png" className="navbar-logo" />
        </Navbar.Brand>
        <div className="navbar-items-wrapper">
          <Navbar.Collapse className="justify-content-between d-flex w-100">
            <Nav className="ml-auto">
              <Nav.Item>
                <Link
                  href={
                    user
                      ? PageRoutes.LandlordRoutes.Home
                      : `${PageRoutes.Intro}?userType=${UserType.Landlord}`
                  }
                >
                  <a className="nav-link">{t('homeNavbar.sitters')}</a>
                </Link>
              </Nav.Item>
              <Nav.Item>
                <Link
                  href={
                    user
                      ? PageRoutes.HousitterRoutes.Home
                      : `${PageRoutes.Intro}?userType=${UserType.Housitter}`
                  }
                >
                  <a className="nav-link">{t('homeNavbar.houses')}</a>
                </Link>
              </Nav.Item>
              <Nav.Item>
                <Link href="/about">
                  <a className="nav-link">{t('homeNavbar.about')}</a>
                </Link>
              </Nav.Item>
            </Nav>

            {user ? (
              <Nav>
                <Nav.Item>
                  <Inbox />
                </Nav.Item>
                <Nav.Item>
                  <Link href="/favourites">
                    <a className="nav-link">{t('homeNavbar.favourites')}</a>
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
                    <NavDropdown.Item href={PageRoutes.Profile}>
                      {t('homeNavbar.editProfile')}
                    </NavDropdown.Item>
                    {userType === UserType.Landlord &&
                      (hasPost ? (
                        <NavDropdown.Item href={PageRoutes.LandlordRoutes.EditHouse}>
                          Edit My Post
                        </NavDropdown.Item>
                      ) : (
                        <NavDropdown.Item href={PageRoutes.LandlordRoutes.EditHouse}>
                          Add Your House
                        </NavDropdown.Item>
                      ))}
                    <SignOut elementType={SignOutElementTypes.NavDropdownItem} />
                  </NavDropdown>
                </Nav.Item>
                <NavDropdown title="Language" id="language-dropdown" className="language-dropdown">
                  <NavDropdown.Item
                    active={currentLocale === 'en'}
                    onClick={() => handleLocaleChange('en')}
                  >
                    <span className="flag-icon flag-icon-us"></span> English
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    active={currentLocale === 'he'}
                    onClick={() => handleLocaleChange('he')}
                  >
                    <span className="flag-icon flag-icon-il"></span> עברית
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            ) : (
              <Nav>
                <Nav.Item>
                  <Button
                    className="ms-4 me-4"
                    onClick={() => {
                      router.push(PageRoutes.Auth.Login)
                    }}
                  >
                    {t('homeNavbar.login')}
                  </Button>
                </Nav.Item>
                <Nav.Item>
                  <Button
                    variant="success"
                    onClick={() => router.push(PageRoutes.Auth.Signup)}
                    className="me-4"
                  >
                    {t('homeNavbar.signup')}
                  </Button>
                </Nav.Item>
                <NavDropdown title="Language" id="language-dropdown" className="language-dropdown">
                  <NavDropdown.Item
                    active={currentLocale === 'en'}
                    onClick={() => handleLocaleChange('en')}
                  >
                    <span className="flag-icon flag-icon-us"></span> English
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    active={currentLocale === 'he'}
                    onClick={() => handleLocaleChange('he')}
                  >
                    <span className="flag-icon flag-icon-il"></span> עברית
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            )}
          </Navbar.Collapse>
          <div className="navbar-item-align-center"></div>
        </div>
      </Container>
    </Navbar>
  )
}
