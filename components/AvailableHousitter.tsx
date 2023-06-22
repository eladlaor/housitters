import Card from 'react-bootstrap/Card'
import { HousitterProps } from '../types/clientSide'
import Picture from './Picture'
import { USER_TYPE } from '../utils/constants'
import ReviewsOnSelectedUser from './ReviewsOnSelectedUser'
import { useSelector } from 'react-redux'
import {
  selectFirstNameState,
  selectLastNameState,
  selectUsersContactedState,
} from '../slices/userSlice'

import MessageSender from './Contact/MessageSender'
import ContactFoundUser from './Contact/ContactFoundUser'

// TODO: should probably rename to Housitter in order to reuse in search results for specific sitter.
export default function AvailableHousitter(props: HousitterProps) {
  const landlordFirstName = useSelector(selectFirstNameState)
  const landlordLastName = useSelector(selectLastNameState)

  const usersContacted = useSelector(selectUsersContactedState)

  return (
    <div>
      <Card bg="primary" style={{ width: '18rem' }}>
        <Card.Body>
          <Picture
            uid={props.housitterId}
            email="" // basically should use housitter email but it doesnt matter here as the filename is alreay saved
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
            isRounded={true}
          />
          <Card.Title>
            {props.firstName} {props.lastName}
            <hr />
          </Card.Title>

          <ContactFoundUser recipientUserId={props.housitterId} />

          {(() => {
            let foundSitter = usersContacted.find((user) => user.userId === props.housitterId)
            if (foundSitter) {
              const { lastContacted } = foundSitter
              return (
                <div>
                  <Card.Text>
                    Email Sent at:{' '}
                    {new Date(lastContacted).toLocaleString('heb-IL', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Card.Text>
                  <hr />
                </div>
              )
            } else {
              return null
            }
          })()}

          <Card.Text>{props.about_me}</Card.Text>

          <ReviewsOnSelectedUser
            selectedUserId={props.housitterId}
            selectedUserFirstName={props.firstName}
            selectedUserLastName={props.lastName}
            selectedUserType={USER_TYPE.Housitter}
          />
        </Card.Body>
      </Card>
    </div>
  )
}
