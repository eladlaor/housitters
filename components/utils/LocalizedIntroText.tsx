export default function localizedIntroText(locale: string | undefined) {
  switch (locale) {
    case 'en':
      return (
        <>
          <h1 style={{ fontWeight: '700' }}>The Housitters WinWinWin Circle</h1>
          <p style={{ fontSize: '1.8rem' }}>
            <span className="highlight-circle-members">Pets</span> get a{' '}
            <span style={{ fontWeight: 'bold' }}>win</span>dfall of fresh-smelling love, while
            they're away from their <br />{' '}
            <span className="highlight-circle-members">Pet Parents</span> who get to spread their{' '}
            <span style={{ fontWeight: 'bold' }}>win</span>gs and travel with peace of mind, knowing
            their loved ones are in the reliable hands of <br />
            <span className="highlight-circle-members">House Sitters</span> who get a{' '}
            <span style={{ fontWeight: 'bold' }}>win</span>dow to new experiences, <br /> meeting
            heart warming houses and <span className="highlight-circle-members">Pets</span>.
          </p>
        </>
      )
    case 'he':
      return (
        <>
          <h1 style={{ fontWeight: '700' }}>הב הב הב: מעגל של אהבה</h1>

          <p style={{ fontSize: '1.8rem' }}>
            <span className="highlight-circle-members">כלבים וחתולים</span> מקבלים יחס אישי ממישהו
            או מישהי שתא<span style={{ fontWeight: 'bold' }}>הב</span> אותם,
            <br />
            <span className="highlight-circle-members">ההורים שלהם</span> מקבלים שלווה וידיעה ש
            <span style={{ fontWeight: 'bold' }}>הב</span>
            ית והחיות בידיים טובות,
            <br />
            <span className="highlight-circle-members">האוסיטרס</span> מקבלים חוויות חדשות ברחבי
            העולם, מישראל ועד אר<span style={{ fontWeight: 'bold' }}>הב</span>,
            <br />
            מתארחים בבתים מגוונים ומארחים בתוך לבם מגוון{' '}
            <span className="highlight-circle-members">כלבים וחתולים</span>.
          </p>
        </>
      )
    case undefined:
      return <></>
  }
}
