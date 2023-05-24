import { createClient } from '@supabase/supabase-js'
import nextConnect from 'next-connect'
import multer from 'multer'
import fs from 'fs'

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_KEY || ''
const supabaseClient = createClient(supabaseUrl, supabaseKey)

// Create a multer instance.
// applies only for POST requests.
const upload = multer({
  dest: './tmp-files', // Adjust the destination folder as needed
  // You can customize the filename as per your requirements
  filename: (req: any, file: any, callback: any) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e7)}`
    callback(null, `${file.fieldname}-${uniqueSuffix}`)
  },
} as any)

const apiRoute = nextConnect<any, any>({
  onError(error, req, res) {
    res.status(501).json({ error: `Sorry something Happened! ${error.message}` })
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` })
  },
})

apiRoute.use(upload.any()) // The Request object will be populated with a files array containing an information object for each processed file.

apiRoute.get(async (req, res) => {
  try {
    const {bucketName, imageName} = req.query

        const { data: downloadData, error: downloadError } = await supabaseClient.storage
          .from(bucketName)
          .download(imageName)

          if (downloadError) {
            console.log(`download error: ${downloadError}`);
            throw downloadError
          }

          if (downloadData) {
            res.setHeader('Content-Type', 'image/jpeg');
            res.status(200).send(downloadData);
          } else {
            res.status(404).json({ error: 'File not found' });
          }


  }
    catch (e) {
      console.log(`error: ${e}`);
      res.stats(400).json({error: 'failed to download file'})
    }
  
})

apiRoute.post(async (req, res) => {
  let tmpFilePath: string = ''
  try {
    const files = req.files // Assuming the file data is passed in the request body
    const { bucketName, upsert } = req.body

    const fileName = files[0].originalname // Adjust this based on your file object structure
    const file = files[0]

    tmpFilePath = file.path
    const fileData = fs.readFileSync(tmpFilePath)

    const mimeType = file.mimetype

    console.log(`this is mimetype: ${mimeType}`)
    console.log(`this is file name: ${fileName}`)
    // Upload the file to Supabase storage
    const { error } = await supabaseClient.storage
      .from(bucketName)
      .upload(fileName, fileData, { upsert: true, contentType: mimeType })
    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`)
    }

    res.status(200).json({ data: 'success' })
  } catch (error) {
    console.error('Failed to upload file', error)
    res.status(400).json({ error: 'Failed to upload file' })
  } finally {
    // TODO: i should add code to remove the file from here
    if (tmpFilePath) {
      fs.unlinkSync(tmpFilePath)
      console.log(`successfully removed file named: ${tmpFilePath}`);
    }
  }
})

export default apiRoute

export const config = {
  api: {
    bodyParser: false,
  },
}
