import { useState } from 'react'
import { Button } from 'react-bootstrap'
import ChatModal from '../Contact/ChatModal'
import { useRouter } from 'next/router'
import { useSessionContext } from '@supabase/auth-helpers-react'
import { useTranslation } from 'react-i18next'

export default function ContactFoundUser({
  recipientUserId,
  className,
  size,
}: {
  recipientUserId: string
  className?: string
  size?: string
}) {
  const { session, isLoading } = useSessionContext()
  const router = useRouter()
  const { t } = useTranslation()

  const [chatWithUser, setChatWithUser] = useState('')

  const handleContactClick = () => {
    if (!isLoading && !session) {
      router.push('/auth/login')
    } else {
      setChatWithUser(recipientUserId)
    }
  }

  return (
    <>
      <Button
        className={className}
        size={(size as 'sm' | 'lg') || 'sm'}
        variant="primary"
        onClick={handleContactClick}
      >
        {t('houses.housePreview.contact')}
      </Button>
      <ChatModal recipientId={chatWithUser} update={setChatWithUser} />
    </>
  )
}
