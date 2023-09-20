import { Container } from 'react-bootstrap'
import Footer from '../components/Footer'

export default function About() {
  return (
    <Container>
      <section id="about-website">
        <h2>About the Website</h2>
        <p>
          Welcome to Housitters, the premier platform that connects house owners with trusted
          house-sitters. We understand the importance of finding reliable and caring individuals to
          take care of your home and pets when you're away. Our website is dedicated to creating a
          secure and easy-to-use environment where you can find the perfect sitter for your specific
          needs.
        </p>
      </section>

      <section id="about-me"></section>

      <section id="faq">
        <h2>Frequently Asked Questions</h2>
        <ul>
          <h3>How does Housitters.com work?</h3>
          <p>
            Our website provides a platform where pet owners can create listings detailing their
            house-sitting requirements. Both sitters and pet owners can then browse through filtered
            search results, and contact each other.
          </p>
          <h3>Why is it better than searching via facebook?</h3>
          <p>
            Facebook does not allow filtering by dates, locations, etc. This site's allows you to
            stop wasting time with endless scrolling, and find what your looking for quicker.
          </p>
          <h3>Why is it better than other house sitting websites online?</h3>
          <p>Because unlike other websites, this one is free :)</p>
        </ul>
      </section>

      <section id="contact-us"></section>
      <Footer />
    </Container>
  )
}
