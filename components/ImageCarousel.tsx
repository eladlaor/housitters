import Carousel from 'react-bootstrap/Carousel'
import { ImageData } from '../types/clientSide'
import Image from 'next/image'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { selectTitleState } from '../slices/createPostSlice'

export default function ImageCarousel({
  imagesData,
  title,
}: {
  imagesData: string[]
  title: string
}) {
  return (
    <Carousel fade interval={2000}>
      {imagesData.map((url, index) => (
        <Carousel.Item
          key={index}
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <img src={url} width={500} height={500} key={index} />

          <Carousel.Caption>
            <h3>{title}</h3>
          </Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>
  )
}
