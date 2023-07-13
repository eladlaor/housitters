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

import ContactFoundUser from './Contact/ContactFoundUser'
import AddToFavourites from './Contact/AddToFavourites'

// TODO: should probably rename to Housitter in order to reuse in search results for specific sitter.
export default function AvailableHousitter(props: HousitterProps) {
  const landlordFirstName = useSelector(selectFirstNameState)
  const landlordLastName = useSelector(selectLastNameState)
  const { housitterId, firstName, lastName, avatarUrl, experience } = props

  const usersContacted = useSelector(selectUsersContactedState)

  return (
    <div style={{ position: 'relative' }}>
      <Card bg="primary" style={{ width: '18rem' }}>
        <Card.Body>
          <div className="center-element make-column">
            <Picture
              uid={props.housitterId}
              email="" // basically should use housitter email but it doesnt matter here as the filename is alreay saved
              url={avatarUrl}
              isIntro={false}
              primaryUse={USER_TYPE.Housitter}
              size={120}
              width={100} // should persist dimensions of image upon upload
              height={100}
              disableUpload={true}
              bucketName="avatars"
              isAvatar={true}
              promptMessage=""
              isRounded={true}
            />
            <Card.Title>
              {firstName} {lastName}
              <hr />
            </Card.Title>
          </div>

          {(() => {
            let foundSitter = usersContacted.find((user) => user.userId === housitterId)
            if (foundSitter) {
              const { lastContacted } = foundSitter
              return (
                <div>
                  <Card.Text>
                    Last Contacted:
                    <br />
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

          <Card.Text className="center-element">
            Experience: {experience} house{experience === 1 ? '' : 's'}
          </Card.Text>
          <hr />
          <Card.Text className="center-element">{props.about_me}</Card.Text>

          <div className="center-element make-column">
            <ReviewsOnSelectedUser
              selectedUserId={housitterId}
              selectedUserFirstName={firstName}
              selectedUserLastName={lastName}
              selectedUserType={USER_TYPE.Housitter}
            />
            <div className="add-to-favourites">
              <AddToFavourites
                favouriteUserId={housitterId}
                favouriteUserType={USER_TYPE.Housitter}
              />
            </div>
            <ContactFoundUser recipientUserId={housitterId} />
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}
