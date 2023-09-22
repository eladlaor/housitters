import Card from 'react-bootstrap/Card'
import { useRouter } from 'next/router'
import { HousitterProps } from '../types/clientSide'
import { PageRoutes, UserType } from '../utils/constants'
import { useSelector } from 'react-redux'
import { selectUsersContactedState } from '../slices/userSlice'
import { Row, Col, Button, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap'
import ContactFoundUser from './Contact/ContactFoundUser'
import AddToFavourites from './Contact/AddToFavourites'
import { getUrlFromSupabase } from '../utils/helpers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
export default function AvailableHousitter(props: HousitterProps) {
  const router = useRouter()
  const { housitterId, firstName, lastName, avatarUrl, experience } = props

  const usersContacted = useSelector(selectUsersContactedState)

  function ExperienceTooltip() {
    return (
      <>
        <Badge>Experience: {experience}</Badge>

        <OverlayTrigger
          key="bottom"
          placement="bottom"
          overlay={
            <Tooltip id={`tooltip-bottom`}>
              The number refers to completed house-sits reported by this sitter.
            </Tooltip>
          }
        >
          <FontAwesomeIcon
            icon={faQuestionCircle}
            style={{
              marginLeft: '5px',
              cursor: 'pointer',
              color: 'green',
            }}
          />
        </OverlayTrigger>
      </>
    )
  }

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
              <ExperienceTooltip />
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
