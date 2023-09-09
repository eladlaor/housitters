import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { NavbarItem } from '../types/clientSide'

export default function IntroNavbar({ navbarItems }: { navbarItems: NavbarItem[] }) {
  const router = useRouter()

  return (
    <Navbar bg="dark" variant="dark" sticky="top">
      <Navbar.Brand href="/">Housitters.com</Navbar.Brand>
      <Navbar.Collapse>
        <Nav className="mr-auto">
          <>
            {navbarItems.map((item, index) => (
              <Nav.Item key={index}>
                <Link
                  href={router.pathname === '/about' ? `#${item.href}` : `/about#${item.href}`}
                  passHref
                >
                  <Nav.Link>{item.text}</Nav.Link>
                </Link>
              </Nav.Item>
            ))}
          </>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}
