import { useSelector } from 'react-redux'
import Picture from './Picture'
import RecommendationSender from './RecommendationSender'
import { selectShowRecommendationFormModalState } from '../slices/recommendationSlice'
import MessageSender from './Contact/MessageSender'
import { selectFirstNameState, selectLastNameState } from '../slices/userSlice'
import ReviewsOnSelectedUser from './ReviewsOnSelectedUser'
import ContactFoundUser from './Contact/ContactFoundUser'

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
        isRounded={false}
      />
      <hr />
      {aboutMe ? aboutMe : `${firstName} didn't write a bio yet.`}
      <MessageSender
        recipientFirstName={firstName}
        recipientLastName={lastName}
        recipientUserId={userId}
        senderFirstName={currentUserFirstName}
        senderLastName={currentUserLastName}
        isChat={false}
      />
      <hr />
      <ReviewsOnSelectedUser
        selectedUserId={userId}
        selectedUserFirstName={firstName}
        selectedUserLastName={lastName}
        selectedUserType={primaryUse}
      />
      <RecommendationSender
        reviewedUserId={userId}
        reviewedUserFirstName={firstName}
        reviewedUserLastName={lastName}
        reviewedUserType={primaryUse}
      />{' '}
      <ContactFoundUser recipientUserId={userId} />
    </div>
  )
}
