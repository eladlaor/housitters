const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://rssznetfvuqctnxfwvzr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzc3puZXRmdnVxY3RueGZ3dnpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjgyNjAyODksImV4cCI6MTk4MzgzNjI4OX0.fyWaISimfSUGQoavOyLah6loAkm3LwJl_YfFDspauIg'
)

const bucketName = process.argv[2] || 'missing-bucketName-arg'

async function deleteAllFilesInBucket() {
  console.log(`removing all files from: ${bucketName} `)

  // Retrieve all files in the storage bucket
  const { data, error } = await supabase.storage.from(bucketName).list()
  console.log(`data is: ${JSON.stringify(data)}`)

  if (error) {
    console.error('Error retrieving files:', error)
    return
  }

  // Delete each file in the bucket
  for (const file of data) {
    const { data, error } = await supabase.storage.from(bucketName).remove(file.name)

    if (error) {
      console.log('Error removing file: ', error)
    } else {
      console.log(`Deleted file: ${file.name}`)
    }
  }

  console.log('All files deleted.')
}

deleteAllFilesInBucket()
