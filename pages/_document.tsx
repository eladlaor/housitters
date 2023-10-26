import Document, { Head, Html, Main, NextScript, DocumentContext } from 'next/document'

interface MyDocumentProps {
  locale?: string
}

class MyDocument extends Document<MyDocumentProps> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    const { locale } = ctx
    return { ...initialProps, locale }
  }

  render() {
    const { locale } = this.props
    return (
      <Html lang={locale || 'en'}>
        <Head>
          <link rel="icon" href="/images/logo.png" />
        </Head>
        <body className="loading">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
