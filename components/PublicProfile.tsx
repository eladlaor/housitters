import { useSelector } from 'react-redux'
import Picture from './Picture'
import RecommendationSender from './RecommendationSender'
import { selectShowRecommendationFormModalState } from '../slices/recommendationSlice'

export default function PublicProfile(props: {
  userId: string
  primaryUse: string
  email: string | null
  aboutMe: string | null
  avatarUrl: string | null
}) {
  const { userId, primaryUse, email, aboutMe, avatarUrl } = props
  const showRecommendationFormModalState = useSelector(selectShowRecommendationFormModalState)

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
      <RecommendationSender
        housitterId={''}
        firstName={''}
        lastName={''}
        recommendedUserType={''}
        recommendedUserAvatarUrl={''}
      />{' '}
    </div>
  )
}
