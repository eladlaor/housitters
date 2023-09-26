import Link from 'next/link'

export default function About() {
  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Housitters.com</h1>
      <div>
        <h2 style={styles.tableOfContents}>Table of Contents</h2>
        <ul>
          <li>
            <a href="#problem">Problem Solved</a>
          </li>
          <li>
            <a href="#motivation">Personal Motivation</a>
          </li>
          <li>
            <a href="#usage">Usage and Features</a>
          </li>
          <li>
            <a href="#future">Future Plans</a>
          </li>
        </ul>
      </div>

      <section id="problem" style={styles.section}>
        <h2>Problem Solved</h2>
        <p>
          Facebook, we have a bone to pick with you!
          <br />
          Nowadays, if you are a house-sitter or a pet-parent, the experience of finding what you're
          looking for is pretty gruesome.
        </p>
        <p>Services other than Housitters.com are currently either:</p>
        <ul>
          <li>
            <strong>Free but inconvenient</strong>:<br /> Facebook, allowing no search filters,
            displaying posts in non-chronological order.
          </li>
          <li>
            <strong>Convenient but costly</strong>: <br />
            similar house-sitting websites charge around 200 USD for a yearly subscription.
          </li>
        </ul>
        <p>
          Housitters.com is the first house-sitting marketplace which is both free and
          user-friendly.
        </p>
        <blockquote>We can finally stop chasing our own tail :)</blockquote>
      </section>

      <section id="motivation" style={styles.section}>
        <h2>Personal Motivation</h2>
        <h3>Coding Motivation</h3>
        <p>
          Since my work experience (in Codefresh) included only backend development, I wanted to
          learn frontend by developing a real-world service. <br /> This was my way to gradually
          acquire frontend skills, aiming to become a full-stack developer.
        </p>

        <h3>House-sitting Motivation</h3>
        <p>
          I've been a house-sitter since April 2021. For a year, I wrote{' '}
          <Link href="https://www.haaretz.co.il/blogs/eladlaor">
            a monthly personal blog about it in "Haaretz",
          </Link>{' '}
          one of Israel's most prominent newspapers:
        </p>
        <p>
          Personally, my experience has been smooth, likely due to the exposure from my blog. I've
          received more house-sitting invitations than I could accept. However, as I was getting to
          know the house-sitting community, I recognized a common frustration with existing
          services. This presented a unique opportunity for me to both develop my coding skills and
          address a genuine problem in my community.
        </p>
        <blockquote>
          Like <del>hitting two birds with one stone</del> racing two dogs with one ball.
        </blockquote>
      </section>

      <section id="usage" style={styles.section}>
        <h2>Usage</h2>
        <h3>Sign Up</h3>
        <p>
          To explore pets, houses, and house-sitters, you first need to sign up. I've ensured
          user-friendly and informative error messages for any unclear steps.
        </p>

        <h3>Housitter or Landlord?</h3>
        <p>
          Upon signing up, define yourself as either a <code>landlord</code> or a{' '}
          <code>housitter</code>. <br />
          The interface varies according to the user type.
        </p>

        <h3>With Housitters.com, you can:</h3>
        <ul>
          <li>Edit your profile and house post respective to your user type.</li>
          <li>
            Filter searches for either houses or sitters:
            <ul>
              <li>By date (single range / multiple ranges / Anytime).</li>
              <li>
                By location (house-sitters can search multiple locations, landlords are limited to
                one).
              </li>
            </ul>
          </li>
          <li>Sort searches according to relevant criteria.</li>
          <li>Bookmark favorite sitters or houses.</li>
          <li>Post and read reviews on other users.</li>
          <li>Get in touch with the site's developer (me:) for feedback or suggestions.</li>
          <li>Contact other registered members.</li>
          <li>Efficiently manage prior chats using a personal inbox.</li>
        </ul>
      </section>

      <section id="future" style={styles.section}>
        <h2>Future Plans</h2>
        <ul>
          <li>
            Add a Hebrew interface, with an option to select the site's language (default: according
            to the user's ip address).
          </li>
          <li>Modify the location options to allow international users.</li>
          <li>
            Introduce a user setting for receiving email notifications upon getting a message on the
            platform. A preliminary implementation exists, but due to potential spam concerns, I
            still have some figuring out to do, to ensure user satisfaction.
          </li>
          <li>Add an easy "Invite a Friend" option.</li>
          <li>Improve the design.</li>
          <li>Launch :)</li>
        </ul>
      </section>
    </div>
  )
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    lineHeight: '1.6',
  },
  header: {
    borderBottom: '2px solid #333',
    paddingBottom: '10px',
    marginBottom: '20px',
  },
  tableOfContents: {
    background: '#f9f9f9',
    padding: '10px 20px',
    borderRadius: '5px',
    marginBottom: '20px',
  },
  section: {
    marginBottom: '40px',
  },
}
