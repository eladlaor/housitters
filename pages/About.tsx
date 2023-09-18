import { Container } from 'react-bootstrap'

export default function About() {
  return (
    <Container>
      <section id="about-website">
        <h2>About the Website</h2>
        <p>
          Welcome to Housitters, the premier platform that connects house owners with trusted
          house-sitters. We understand the importance of finding reliable and caring individuals to
          take care of your home and pets when you're away. Our website is dedicated to creating a
          secure and friendly environment where you can find the perfect sitter for your specific
          needs.
        </p>
      </section>

      <section id="about-me"></section>

      <section id="faq">
        <h2>Frequently Asked Questions</h2>
        <ul>
          <h3>How does Housitters work?</h3>
          <p>
            Our website provides a platform where pet owners can create listings detailing their
            house-sitting requirements. Both sitters and pet ownwers can then browse through
            filtered search results, and contact each other.
          </p>
        </ul>
      </section>

      <section id="contact-us"></section>
    </Container>
  )
}
