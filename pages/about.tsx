import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export default function About() {
  const { t } = useTranslation()

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>{t('about.title')}</h1>
      <div>
        <h2 style={styles.tableOfContents}>{t('about.tableOfContents')}</h2>
        <ul>
          <li>
            <a href="#problem">{t('about.toc.problem')}</a>
          </li>
          <li>
            <a href="#motivation">{t('about.toc.motivation')}</a>
          </li>
          <li>
            <a href="#usage">{t('about.toc.usage')}</a>
          </li>
          <li>
            <a href="#future">{t('about.toc.future')}</a>
          </li>
        </ul>
      </div>

      <section id="problem" style={styles.section}>
        <h2>{t('about.problem.title')}</h2>
        <p>{t('about.problem.paragraph1')}</p>
        <p>{t('about.problem.paragraph2')}</p>
        <ul>
          <li>{t('about.problem.list.item1')}</li>
          <li>{t('about.problem.list.item2')}</li>
        </ul>
        <p>{t('about.problem.paragraph3')}</p>
        <blockquote>{t('about.problem.blockquote')}</blockquote>
      </section>

      <section id="motivation" style={styles.section}>
        <h2>{t('about.toc.motivation')}</h2>
        <p>
          {t('about.motivation.description1')}{' '}
          <Link href="https://www.haaretz.co.il/blogs/eladlaor">
            {t('about.motivation.description2')}
          </Link>{' '}
          {t('about.motivation.description3')}
        </p>
        <blockquote>
          {t('about.motivation.punch1')} <del> {t('about.motivation.punch2')}</del>{' '}
          {t('about.motivation.punch3')}
        </blockquote>
      </section>

      <section id="usage" style={styles.section}>
        <h2>{t('about.toc.usage')}</h2>
        <h3>{t('about.usage.signUp')}</h3>
        <p>
          {t('about.usage.signUpInfo1')}
          <code> {t('about.usage.signUpInfo2')}</code> {t('about.usage.signUpInfo3')} <code></code>{' '}
          {t('about.usage.signUpInfo4')}. {t('about.usage.signUpInfo5')}
        </p>
        <h3> {t('about.usage.withHousitters')}</h3>
        <ul>
          <li>{t('about.usage.createProfile')}</li>
          <li>{t('about.usage.contact')}</li>
          <li>
            {t('about.usage.filter')}
            <ul>
              <li>{t('about.usage.byDate')}</li>
              <li>{t('about.usage.byLocation')}</li>
              <li>{t('about.usage.post')}</li>
            </ul>
          </li>
          <li>{t('about.usage.sort')}</li>
          <li>{t('about.usage.bookmark')}</li>
          <li>{t('about.usage.reviews')}</li>
          <li>{t('about.usage.getInTouch')}</li>
          <li>{t('about.usage.manage')}</li>
        </ul>
      </section>

      <section id="future" style={styles.section}>
        <h2>{t('about.toc.future')}</h2>
        <ul>
          <li>{t('about.futurePlans.modify')}</li>
          <li>{t('about.futurePlans.friend')}</li>
          <li>{t('about.futurePlans.notifications')}</li>
          <li>{t('about.futurePlans.graphic')}</li>
          <li>{t('about.futurePlans.launch')}</li>
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
