import { Button } from 'react-bootstrap'
import Card from 'react-bootstrap/Card'
import { HousitterProps } from '../types/clientSide'
import Picture from './Picture'
import { USER_TYPE } from '../utils/constants'
import { useState } from 'react'
import RecommendationForm from './RecommendationForm'
import Recommendations from './Recommendations'
import { useSelector } from 'react-redux'
import { selectSittersContactedState } from '../slices/landlordSlice'
import MessageSender from './MessageSender'

// TODO: should probably rename to Housitter in order to reuse in search results for specific sitter.
export default function AvailableHousitter({ props }: { props: HousitterProps }) {
  const [showRecModal, setShowRecModal] = useState(false)
  const [showAllRecsModal, setShowAllRecsModal] = useState(false)
  const [recommendations, setRecommendations] = useState([] as any[]) // TODO: type it

  const sittersContacted = useSelector(selectSittersContactedState)

  return (
    <div>
      <Card bg="success" style={{ width: '18rem' }}>
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
          />
          <Card.Title>
            {props.firstName} {props.lastName}
            <hr />
          </Card.Title>

          <MessageSender
            props={{
              firstName: props.firstName,
              lastName: props.lastName,
              housitterId: props.housitterId,
            }}
          />

          {(() => {
            let foundSitter = sittersContacted.find(
              (sitter) => sitter.housitterId === props.housitterId
            )
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

          <Button variant="warning" onClick={() => setShowRecModal(true)}>
            Recommend
          </Button>

          {showRecModal && (
            <RecommendationForm
              housitterId={props.housitterId}
              firstName={props.firstName}
              lastName={props.lastName}
              recommendedUserType={USER_TYPE.Housitter}
              recommendedUserAvatarUrl={props.avatarUrl as string}
              showRecModal={showRecModal}
              setShowRecModal={setShowRecModal}
            />
          )}
          <Button variant="info" onClick={() => setShowAllRecsModal(true)}>
            See recommendations
          </Button>
          {showAllRecsModal && (
            <Recommendations
              firstName={props.firstName}
              lastName={props.lastName}
              housitterId={props.housitterId}
              showAllRecsModal={showAllRecsModal}
              setShowAllRecsModal={setShowAllRecsModal}
              recommendations={recommendations}
              setRecommendations={setRecommendations}
            />
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
