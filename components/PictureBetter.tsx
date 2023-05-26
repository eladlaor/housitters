import React, { BlockquoteHTMLAttributes, useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Database } from '../types/supabase'
import { useDispatch, useSelector } from 'react-redux'
import { selectAvatarUrlState, setAvatarUrl } from '../slices/userSlice'
import { selectImagesUrlsState, setImagesUrlsState } from '../slices/postSlice'
import Image from 'next/image'
import { Button, Form } from 'react-bootstrap'
import { ImageData } from '../types/clientSide'
import Resizer from 'react-image-file-resizer'

type Profiles = Database['public']['Tables']['profiles']['Row']

export default function PictureBetter({
  isIntro,
  uid,
  primaryUse,
  url,
  size,
  width,
  height,
  disableUpload,
  bucketName,
  isAvatar,
  promptMessage,
  email,
}: {
  isIntro: boolean
  uid: string
  primaryUse: string
  url: Profiles['avatar_url']
  size: number // TODO: can change this completely to different use: quality
  width: number
  height: number
  disableUpload: boolean
  bucketName: string
  isAvatar: boolean
  promptMessage: string
  email: string
}) {
  const supabaseClient = useSupabaseClient()
  const dispatch = useDispatch()

  const avatarUrl = useSelector(selectAvatarUrlState)
  const [uploading, setUploading] = useState(false)

  const [previewDataUrls, setPreviewDataUrls] = useState([] as ImageData[])
  const [fileNames, setFileNames] = useState([] as ImageData[])

  function removeInvalidCharacters(fileName: string): string {
    const hebrewToEnglishMap: { [key: string]: string } = {
      א: 'a',
      ב: 'b',
      ג: 'g',
      ד: 'd',
      ה: 'h',
      ו: 'v',
      ז: 'z',
      ח: 'kh',
      ט: 't',
      י: 'y',
      כ: 'k',
      ל: 'l',
      מ: 'm',
      נ: 'n',
      ס: 's',
      ע: 'a',
      פ: 'p',
      צ: 'ts',
      ק: 'k',
      ר: 'r',
      ש: 'sh',
      ת: 't',
      ן: 'n',
      ך: 'k',
      ם: 'm',
      ף: 'p',
      ץ: 'ts',
      '׳': "'",
      '״': '"',
    }

    const hebToEngRegex = new RegExp(Object.keys(hebrewToEnglishMap).join('|'), 'g')
    const noHebrewFileName = fileName.replace(hebToEngRegex, (match) => hebrewToEnglishMap[match])

    const allInvalidFileNameCharacters = /[^a-zA-Z0-9]/g
    return noHebrewFileName.replace(allInvalidFileNameCharacters, '')
  }

  useEffect(() => {
    if (url) {
      downloadImage(url)
    } else {
      console.log('no url received in PictureBetter')
    }
  }, [url])

  const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new window.Image()
        img.src = reader.result as string
        img.onload = () => {
          const aspectRatio = img.width / img.height
          let targetWidth, targetHeight

          if (aspectRatio < 1) {
            // horizontal
            targetWidth = maxWidth
            targetHeight = maxWidth / aspectRatio
          } else {
            // vertical
            targetWidth = maxHeight * aspectRatio
            targetHeight = maxHeight
          }

          Resizer.imageFileResizer(
            file,
            targetWidth,
            targetHeight,
            'JPEG',
            70,
            0,
            (resizedImage: any) => {
              resolve(resizedImage)
            },
            'blob'
          )
        }
      }
    })
  }

  // TODO: get rid of the resolve reject syntax
  function blobToBuffer(blob: Blob): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsArrayBuffer(blob)
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          const buffer = Buffer.from(reader.result)
          resolve(buffer)
        } else {
          reject(new Error('Failed to convert Blob to Buffer.'))
        }
      }
      reader.onerror = (error) => {
        reject(error)
      }
    })
  }

  // TODO: duplicated: I have Picture component, and onPostImageSelection in landlords home, and landlord intro
  async function handleAvatarUpload(event: any) {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      for (const file of event.target.files) {
        const fileName = removeInvalidCharacters(`${email}-${file.name}`)

        // NOTICE: with this size, image is between 5 to 10 MB.
        // if the supabse bucket is set to limit the size to less than 10MB,
        // it might cause a Network Error when trying to upload the file.
        const resizedImage = await resizeImage(file, 1920, 1080)

        console.log('uploading to avatars')
        let { error: uploadError } = await supabaseClient.storage
          .from('avatars')
          .upload(fileName, resizedImage, { upsert: true })
        // TODO: not the best naming method, i should change it

        if (uploadError) {
          alert(`error in housitters/Intro trying to upload an avatar to avatars ` + uploadError)
          debugger
          throw uploadError
        }

        console.log('SUCCESSFULLY uploaded to avatars')
        dispatch(setAvatarUrl(fileName))

        const buffer = await blobToBuffer(resizedImage)

        // conveting to the url format needed to display the preview image
        const previewDataUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`

        // perparing the updated previewUrls array, with the updated element, adding an index which would be used at deletion
        // the index is set this way in order to prevent mismatches between fileName id and previewId, which may be caused for example when having 3 images, and deleting the second one.

        // TODO: this should be an array just when its not avatar, which is single picture
        // const updatedPreviews = [
        //   ...previewDataUrls,
        //   { url: previewDataUrl, id: previewDataUrls.length },
        // ]

        const updatedPreviews = [{ url: previewDataUrl, id: 0 }]

        setPreviewDataUrls(updatedPreviews)

        const updatedFileNames = [{ url: fileName, id: 0 }]
        setFileNames(updatedFileNames)
      }
    } catch (e: any) {
      alert(e.message)
      debugger
    } finally {
      setUploading(false)
    }
  }

  // TODO: duplicated
  async function handleDeleteImage(previewData: ImageData, e: any) {
    e.preventDefault()
    const copyOfPreviewImagesUrls = [...previewDataUrls]
    const filteredPreviewImagesUrls = copyOfPreviewImagesUrls.filter(
      (img: ImageData) => img.url !== previewData.url
    )

    const copyOfFileNames = [...fileNames]
    const filteredFileNames = copyOfFileNames.filter(
      (imageData: ImageData) => imageData.id != previewData.id
    )

    const fileNameToRemove = (
      fileNames.find((fileData) => fileData.id === previewData.id) as ImageData
    ).url

    // remove from storage
    let { error: fileRemovalError } = await supabaseClient.storage
      .from(bucketName)
      .remove([fileNameToRemove])

    if (fileRemovalError) {
      alert(fileRemovalError.message)
      debugger
      throw fileRemovalError
    }

    // TODO: remove from db?
    // at this point, no removal from db is needed. no user yet. maybe in the future, but maybe to allow only edit (upsert)

    setPreviewDataUrls(filteredPreviewImagesUrls)
    setFileNames(filteredFileNames)
  }

  async function downloadImage(fileName: string) {
    try {
      const { data: downloadedFileData, error } = await supabaseClient.storage
        .from(bucketName)
        .download(fileName)
      if (error) {
        alert(`failed downloadimage: ${error}`)
        debugger
        throw error
      }

      const buffer = await blobToBuffer(downloadedFileData)

      // TODO: should maybe use URL.createObjectURL instead of this method.
      const previewDataUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`
      const updatedPreviews = [{ url: previewDataUrl, id: 0 }]

      setPreviewDataUrls(updatedPreviews)

      // const url = URL.createObjectURL(data)
      // dispatch(setAvatarUrl(url))
    } catch (error) {
      alert('Error downloading image: ' + error)
      debugger
      throw error
    }
  }

  return (
    <div>
      {isIntro && (
        <div>
          <Form.Label>
            {disableUpload ? '' : uploading ? 'Uploading ...' : promptMessage}
          </Form.Label>
          <br />
          {isAvatar && (
            <input
              onChange={(e: any) => handleAvatarUpload(e)}
              type="file"
              name="file" // TODO: make sure i understand where this is meant to be used.
              accept="image/*"
              /* TODO: disbaled=? */
            />
          )}
        </div>
      )}
      {previewDataUrls.length > 0 && <h1>got previewdata</h1>}
      {previewDataUrls.map((previewData: ImageData, index: number) => (
        <div key={index}>
          <Image src={previewData.url} height={size} width={size} key={index} />

          {!disableUpload && (
            <Button
              variant="danger"
              onClick={(e) => handleDeleteImage(previewData, e)}
              key={`delete-${index}`}
              name={`image-${index}`}
            >
              delete
            </Button>
          )}
        </div>
      ))}
      <hr />
    </div>
  )
}
