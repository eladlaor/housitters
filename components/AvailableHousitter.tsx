import { Button } from 'react-bootstrap'
import Card from 'react-bootstrap/Card'
import { HousitterProps } from '../types/clientSide'
import PictureBetter from './PictureBetter'
import { USER_TYPE } from '../utils/constants'
import axios from 'axios'

async function handleSendMessage(e: any) {
  e.preventDefault()
  const response = await axios.post('/api/send-emails', {
    someProp: 'hi',
  })

  if (response.status === 200) {
    console.log('successful call')
  } else {
    console.log('bad response')
  }
}

export default function AvailableHousitter({ props }: { props: HousitterProps }) {
  return (
    <div>
      <Card bg="success" style={{ width: '18rem' }}>
        <Card.Body>
          <PictureBetter
            uid={props.housitterId}
            email="" // TODO: basically should use housitter email but it doesnt matter here
            url={props.avatarUrl}
            isIntro={false}
            primaryUse={USER_TYPE.Housitter}
            size={100}
            width={100} // should persist dimensions of image upon upload
            height={100}
            disableUpload={true}
            bucketName="avatars"
            isAvatar={true}
            promptMessage=""
          />
          <Card.Title>
            {props.firstName} {props.lastName}
          </Card.Title>
          <Card.Text>{props.about_me}</Card.Text>
          <Button variant="secondary" onClick={handleSendMessage}>
            Send message
          </Button>
        </Card.Body>
      </Card>
    </div>
  )
}
