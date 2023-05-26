import React, { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Database } from '../types/supabase'
import { useDispatch, useSelector } from 'react-redux'
import { selectAvatarUrlState, setAvatarUrl } from '../slices/userSlice'
import Image from 'next/image'

type Profiles = Database['public']['Tables']['profiles']['Row']
export default function Avatar({
  uid,
  url,
  size,
  onUpload,
  disableUpload,
  bucketName,
}: {
  uid: string
  url: Profiles['avatar_url']
  size: number
  onUpload: (url: string) => void
  disableUpload: boolean
  bucketName: string
}) {
  const supabase = useSupabaseClient<Database>()
  const dispatch = useDispatch()
  const avatarUrl = useSelector(selectAvatarUrlState)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (url) downloadImage(url)
  }, [url])

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage.from(bucketName).download(path)
      if (error) {
        throw error
      }
      const url = URL.createObjectURL(data)
      dispatch(setAvatarUrl(url))
    } catch (error) {
      console.log('Error downloading image: ', error)
    }
  }

  const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${uid}.${fileExt}`
      const filePath = `${fileName}`

      let { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      onUpload(filePath)
    } catch (error) {
      alert('Error uploading avatar!')
      console.log(error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {avatarUrl ? (
        <Image src={avatarUrl} alt="Avatar" className="avatar image" height={size} width={size} />
      ) : (
        <div className="avatar no-image" style={{ height: size, width: size }} />
      )}
      <div style={{ width: size }}>
        <label className="button primary block" htmlFor="single">
          {disableUpload ? '' : uploading ? 'Uploading ...' : 'Upload'}
        </label>
        <input
          style={{
            visibility: 'hidden',
            position: 'absolute',
          }}
          type="file"
          id="single"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </div>
    </div>
  )
}
