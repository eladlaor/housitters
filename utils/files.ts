import Resizer from 'react-image-file-resizer'

export function removeInvalidCharacters(fileName: string): string {
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

export const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<Blob> => {
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

export // TODO: get rid of the resolve reject syntax
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
