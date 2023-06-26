import IntroNavbar from '../components/IntroNavbar'
import { NavbarItems } from '../utils/constants'

export default function About() {
  return (
    <div>
      <IntroNavbar navbarItems={NavbarItems} />
      <div style={{ height: '90vh' }} id="about-housitting">
        <h1>About housitting</h1>
      </div>
      <div style={{ height: '90vh' }} id="about-us">
        <h1>About us</h1>
      </div>
      <div style={{ height: '90vh' }} id="faq">
        <h1>FAQ</h1>
      </div>
      <div style={{ height: '90vh' }} id="contact-us">
        <h1>Contact us</h1>
      </div>
    </div>
  )
}
