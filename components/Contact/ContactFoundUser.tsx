import { useState } from 'react'
import { Button } from 'react-bootstrap'
import ChatModal from '../Contact/ChatModal'
import { Router, useRouter } from 'next/router'
import { useSessionContext } from '@supabase/auth-helpers-react'

export default function ContactFoundUser({
  recipientUserId,
  className,
  size,
}: {
  recipientUserId: string
  className?: string
  size?: string
}) {
  const router = useRouter()
  const { session, isLoading } = useSessionContext()
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
        Contact
      </Button>
      <ChatModal recipientId={chatWithUser} update={setChatWithUser} />
    </>
  )
}
