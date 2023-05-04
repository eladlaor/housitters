import { Button } from 'react-bootstrap'
import Card from 'react-bootstrap/Card'
import { HousitterProps } from '../types/clientSide'
import Picture from './Picture'

export default function AvailableHousitter({ props }: { props: HousitterProps }) {
  // debugger
  // console.log(props)
  return (
    <div>
      <Card bg="success" style={{ width: '18rem' }}>
        <Card.Body>
          <Picture
            uid={props.housitterId}
            url={props.avatarUrl}
            size={100}
            onUpload={() => {}}
            disableUpload={true}
            bucketName="avatars"
          />
          <Card.Title>
            {props.firstName} {props.lastName}
          </Card.Title>
          <Card.Text>{props.avatarUrl}</Card.Text>
          <Card.Text>{props.about_me}</Card.Text>
          <Button variant="secondary">Send message</Button>
        </Card.Body>
      </Card>
    </div>
  )
}
