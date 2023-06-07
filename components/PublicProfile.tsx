import { useSelector } from 'react-redux'
import Picture from './Picture'
import RecommendationSender from './RecommendationSender'
import { selectShowRecommendationFormModalState } from '../slices/recommendationSlice'
import MessageSender from './MessageSender'
import { selectFirstNameState, selectLastNameState } from '../slices/userSlice'

export default function PublicProfile(props: {
  userId: string
  primaryUse: string
  firstName: string
  lastName: string
  email: string | null
  aboutMe: string | null
  avatarUrl: string
}) {
  const { userId, primaryUse, firstName, lastName, email, aboutMe, avatarUrl } = props
  const showRecommendationFormModalState = useSelector(selectShowRecommendationFormModalState)

  const currentUserFirstName = useSelector(selectFirstNameState)
  const currentUserLastName = useSelector(selectLastNameState)

  return (
    <div>
      <Picture
        isIntro={false}
        uid={userId}
        primaryUse={primaryUse}
        url={avatarUrl}
        size={50}
        width={50}
        height={50}
        disableUpload={true}
        bucketName={'avatars'}
        isAvatar={true}
        promptMessage={''}
        email={email ? email : ''}
      />
      {aboutMe}
      <MessageSender
        recipientFirstName={firstName}
        recipientLastName={lastName}
        recipientUserId={userId}
        senderFirstName={currentUserFirstName}
        senderLastName={currentUserLastName}
        isChat={false}
      />
      <RecommendationSender
        housitterId={userId}
        firstName={firstName}
        lastName={lastName}
        recommendedUserType={primaryUse}
        recommendedUserAvatarUrl={avatarUrl}
      />{' '}
    </div>
  )
}
