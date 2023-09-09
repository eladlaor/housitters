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
        <p>
          Whether you're planning a vacation, a business trip, or simply need someone to watch over
          your property, our platform makes it easy to connect with responsible individuals who will
          treat your home as if it were their own. Join our vibrant community today and experience
          the peace of mind that comes with knowing your house and pets are in good hands.
        </p>
      </section>

      <section id="about-me">
        <h2>About Me</h2>
        <p>
          Hi, I'm Elad Laor, the founder of Housitters. Like many people, I've always had a deep
          love for animals and a strong sense of community. However, I often found it challenging to
          find trustworthy individuals to care for my pets and home while I was away. This struggle
          inspired me to create this platform, a place where house owners can find reliable sitters
          and build meaningful connections within their local community.
        </p>
        <p>
          I believe that by fostering a sense of trust, mutual respect, and shared responsibility,
          we can create a network of individuals who support each other in their house-sitting
          needs. Housitters aims to bring people together, ensuring that both house owners and
          sitters have a positive and rewarding experience every time.
        </p>
      </section>

      <section id="faq">
        <h2>Frequently Asked Questions</h2>
        <ul>
          <li>
            <h3>How does Housitters work?</h3>
            <p>
              Our website provides a platform where house owners can create listings detailing their
              house-sitting requirements. Sitters can then browse these listings and apply to become
              the perfect match. The house owner and sitter can communicate, exchange information,
              and agree on the terms of the house-sitting arrangement. It's all about building trust
              and finding the right fit for both parties.
            </p>
          </li>
          <li>
            <h3>Is it safe to use Housitters?</h3>
            <p>
              Yes, we prioritize safety and security. All members are required to complete a
              thorough verification process, including identity verification and background checks.
              We also provide a review system, allowing users to share their experiences and provide
              feedback. While we take these precautions, it's still important to exercise caution
              and trust your instincts when interacting with others.
            </p>
          </li>
          <li>
            <h3>Do I have to pay to use Housitters?</h3>
            <p>
              Creating an account and browsing listings is free. However, we offer premium features
              and additional benefits through our paid membership plans. These plans provide
              enhanced visibility for your listings and access to exclusive community events and
              resources.
            </p>
          </li>
        </ul>
      </section>

      <section id="contact-us">
        <h2>Contact Us</h2>
        <p>
          We'd love to hear from you! If you have any questions, suggestions, or feedback, please
          don't hesitate to reach out to us. Our dedicated support team is here to assist you.
        </p>
        <p>
          You can contact us by email at{' '}
          <a href="mailto:info@housitters.com">info@housitters.com</a> or by using the contact form
          below:
        </p>
      </section>
    </Container>
  )
}
