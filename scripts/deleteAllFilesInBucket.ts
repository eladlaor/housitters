const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_KEY || ''
const supabaseClient = createClient(supabaseUrl, supabaseKey)

const bucketName = 'avatars'

async function deleteAllFilesInBucket() {
  console.log(`removing all files from: ${bucketName} `)

  // Retrieve all files in the storage bucket
  const { data, error } = await supabaseClient.storage.from(bucketName).list()
  console.log(`data is: ${JSON.stringify(data)}`)

  if (error) {
    console.error('Error retrieving files:', error)
    return
  }

  // Delete each file in the bucket
  for (const file of data) {
    const { data, error } = await supabaseClient.storage.from(bucketName).remove(file.name)

    if (error) {
      console.log('Error removing file: ', error)
    } else {
      console.log(`Deleted file: ${file.name}`)
    }
  }

  console.log('All files deleted.')
}

deleteAllFilesInBucket()
