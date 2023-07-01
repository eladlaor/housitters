import React, { BlockquoteHTMLAttributes, useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Database } from '../types/supabase'
import { useDispatch, useSelector } from 'react-redux'
import { setAvatarUrl } from '../slices/userSlice'
import Image from 'next/image'
import { Button, Form } from 'react-bootstrap'
import { ImageData } from '../types/clientSide'
import Resizer from 'react-image-file-resizer'

type Profiles = Database['public']['Tables']['profiles']['Row']

// TODO: should unify the way i get props for each component
export default function Picture({
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
  isRounded,
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
  isRounded: boolean
}) {
  const supabaseClient = useSupabaseClient()
  const dispatch = useDispatch()

  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

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
        console.log(`dispatched ${fileName} as avatarUrl to redux`)

        const buffer = await blobToBuffer(resizedImage)

        // conveting to the url format needed to display the preview image
        const previewDataUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`

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

    const fileNameToRemove = fileNames
      ? (fileNames.find((fileData) => fileData.id === previewData.id) as ImageData).url
      : ''

    if (!fileNameToRemove) {
      alert(`no file to remove`)
      debugger
      return
    }

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
    dispatch(setAvatarUrl(''))
  }

  async function downloadImage(fileName: string) {
    try {
      setLoading(true)
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
      setLoading(false)

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
          {isAvatar && previewDataUrls.length === 0 ? (
            <input
              onChange={(e: any) => handleAvatarUpload(e)}
              type="file"
              name="file"
              accept="image/*"
              /* TODO: disbaled=? */
            />
          ) : (
            <Button
              variant="danger"
              onClick={(e) => handleDeleteImage(previewDataUrls[0], e)}
              key={`delete-${0}`}
              name={`image-${0}`}
            >
              Delete Picture
            </Button>
          )}
        </div>
      )}
      {loading
        ? 'Loading picture'
        : previewDataUrls.map((previewData: ImageData, index: number) => (
            <div key={index}>
              <Image
                src={previewData.url}
                height={size}
                width={size}
                key={index}
                className={isRounded ? 'rounded-image' : ''}
              />

              {!isAvatar && !disableUpload && (
                <Button
                  variant="danger"
                  onClick={(e) => handleDeleteImage(previewData, e)}
                  key={`delete-${index}`}
                  name={`image-${index}`}
                >
                  Delete
                </Button>
              )}
            </div>
          ))}
    </div>
  )
}
