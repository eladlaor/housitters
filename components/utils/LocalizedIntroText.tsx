export default function localizedIntroText(locale: string | undefined) {
  switch (locale) {
    case 'en':
      return (
        <>
          <h1 style={{ fontWeight: '700' }}>The Housitters WinWinWin Circle</h1>
          <p style={{ fontSize: '1.8rem' }}>
            <span className="highlight-circle-members">Pets</span> get a{' '}
            <span style={{ fontWeight: 'bold' }}>win</span>dfall of fresh-smelling love while
            they're away from their <br />{' '}
            <span className="highlight-circle-members">Pet Parents</span> who spread their{' '}
            <span style={{ fontWeight: 'bold' }}>win</span>gs getting peace of mind from reliable{' '}
            <br />
            <span className="highlight-circle-members">House Sitters</span> who get a{' '}
            <span style={{ fontWeight: 'bold' }}>win</span>dow to heart-warming houses and{' '}
            <span className="highlight-circle-members">Pets</span>.
          </p>
        </>
      )
    case 'he':
      return (
        <>
          <h1 style={{ fontWeight: '700' }}>הב הב הב: מעגל של אהבה</h1>
          <p style={{ fontSize: '1.8rem' }}>
            <span className="highlight-circle-members">הכלבלב</span> נשאר בבית ומרגיש נא
            <span style={{ fontWeight: 'bold' }}>הב</span>,
            <br />
            <span className="highlight-circle-members">הוריו</span> מקבלים שלווה, תמונות וסרטונים
            מכאן ועד אר
            <span style={{ fontWeight: 'bold' }}>ה"ב</span>
            ,
            <br />
            <span className="highlight-circle-members">האוסיטרס</span> שומרים על{' '}
            <span style={{ fontWeight: 'bold' }}>הב</span>ית החם, מארחים בליבם את{' '}
            <span className="highlight-circle-members">הכלבלב</span>...
          </p>
        </>
      )
    case undefined:
      return <></>
  }
}
