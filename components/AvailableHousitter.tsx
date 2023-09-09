import Card from 'react-bootstrap/Card'
import { useRouter } from 'next/router'
import { HousitterProps } from '../types/clientSide'
import Picture from './Picture'
import { PageRoutes, UserType } from '../utils/constants'
import ReviewsOnSelectedUser from './ReviewsOnSelectedUser'
import { useSelector } from 'react-redux'
import {
  selectFirstNameState,
  selectLastNameState,
  selectUsersContactedState,
} from '../slices/userSlice'
import { Row, Col, Button } from 'react-bootstrap'
import ContactFoundUser from './Contact/ContactFoundUser'
import AddToFavourites from './Contact/AddToFavourites'
import { getUrlFromSupabase } from '../utils/helpers'

// TODO: should probably rename to Housitter in order to reuse in search results for specific sitter.
export default function AvailableHousitter(props: HousitterProps) {
  const router = useRouter()
  const landlordFirstName = useSelector(selectFirstNameState)
  const landlordLastName = useSelector(selectLastNameState)
  const { housitterId, firstName, lastName, avatarUrl, experience } = props

  const usersContacted = useSelector(selectUsersContactedState)

  return (
    <Card className="w-100 mt-4">
      <Card.Body>
        <Row>
          <Col xs={1} className="d-flex align-items-center">
            {avatarUrl && (
              <img
                src={getUrlFromSupabase(avatarUrl, 'avatars')}
                style={{
                  position: 'absolute',
                  width: 60,
                  height: 60,
                  borderRadius: 1000,
                }}
              />
            )}
            {/* <Picture */}
            {/*   uid={props.housitterId} */}
            {/*   email="" // basically should use housitter email but it doesnt matter here as the filename is alreay saved */}
            {/*   url={avatarUrl} */}
            {/*   isIntro={false} */}
            {/*   primaryUse={UserType.Housitter} */}
            {/*   size={120} */}
            {/*   width={100} // should persist dimensions of image upon upload */}
            {/*   height={100} */}
            {/*   disableUpload={true} */}
            {/*   bucketName="avatars" */}
            {/*   isAvatar={true} */}
            {/*   promptMessage="" */}
            {/*   isRounded={true} */}
            {/* /> */}
          </Col>
          <Col>
            <div>
              <Card.Title style={{ fontWeight: 'bold' }}>
                {firstName} {lastName}
              </Card.Title>
              Experience: {experience} house{experience === 1 ? '' : 's'}
              {(() => {
                let foundSitter = usersContacted.find((user) => user.userId === housitterId)
                if (foundSitter) {
                  const { lastContacted } = foundSitter
                  return (
                    <>
                      <br /> Last Contacted:&nbsp;
                      {new Date(lastContacted).toLocaleString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </>
                  )
                } else {
                  return null
                }
              })()}
            </div>
          </Col>
          <Col>
            <Card.Text className="center-element">{props.about_me}</Card.Text>
          </Col>
          <Col style={{ textAlign: 'right' }}>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => {
                router.push(`${PageRoutes.LandlordRoutes.Home}/${housitterId}`)
              }}
            >
              Details
            </Button>

            <ContactFoundUser className="mt-2" recipientUserId={housitterId} />
          </Col>
          <Col xs={1}>
            <AddToFavourites favouriteUserId={housitterId} favouriteUserType={UserType.Housitter} />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}
