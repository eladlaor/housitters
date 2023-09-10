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

export function arraysContainSameElements(arr1: string[], arr2: string[]) {
  // debugger
  if (arr1.length !== arr2.length) {
    console.log('false from helper')
    return false
  } else {
    console.log('true from helper')
    return true
  }

  // const map = new Map()

  // for (let str of arr1) {
  //   map.set(str, (map.get(str) || 0) + 1)
  // }

  // // If the string is not in arr1, arrays are different
  // for (let str of arr2) {
  //   if (!map.has(str)) {
  //     return false
  //   }

  //   map.set(str, map.get(str) - 1)
  //   if (map.get(str) === 0) {
  //     map.delete(str)
  //   }
  //   // If count becomes 0, remove the entry
  // }

  // console.log(`${map.size === 0 ? 'eqaul' : 'not eqaul'}`)

  // return map.size === 0 // If the map is empty, arrays contain the same elements
}
