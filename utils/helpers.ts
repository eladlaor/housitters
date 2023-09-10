export const getURL = () => {
  const url =
    process?.env?.URL && process.env.URL !== ''
      ? process.env.URL
      : process?.env?.VERCEL_URL && process.env.VERCEL_URL !== ''
      ? process.env.VERCEL_URL
      : 'http://localhost:3000'
  return url.includes('http') ? url : `https://${url}`
}

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export const getUrlFromSupabase = (url: string, bucket: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(url)
  return data.publicUrl
}

export const handleError = (errorMessage: string, thrownFromFunctionName: string) => {
  console.log(`Error in ${thrownFromFunctionName}. Error: ${errorMessage}`)
  debugger
  return
}
