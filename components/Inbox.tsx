import { useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { NavDropdown } from 'react-bootstrap'

import { UserType } from '../utils/constants'

import { selectPrimaryUseState, selectUsersContactedState } from '../slices/userSlice'
import { getUrlFromSupabase } from '../utils/helpers'
import Badge from 'react-bootstrap/Badge'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelopeOpenText } from '@fortawesome/free-solid-svg-icons'
import ChatModal from './Contact/ChatModal'

const groupByKey = (list, key) =>
  list.reduce((hash, obj) => ({ ...hash, [obj[key]]: (hash[obj[key]] || []).concat(obj) }), {})

const oppositeType = (userType) => (userType === 'landlord' ? 'housitter' : 'landlord')

export default function Inbox() {
  const user = useUser()
  const supabaseClient = useSupabaseClient()

  const [messages, setMessages] = useState([])
  const [chatWithUser, setChatWithUser] = useState('')
  const currentUserType = useSelector(selectPrimaryUseState)
  const usersContacted = useSelector(selectUsersContactedState)
  useEffect(() => {
    async function loadInboxData() {
      const { error, data } = await supabaseClient
        .from('messages')
        .select(
          `id, created_at, message_content, housitter_id, landlord_id, is_read_by_recipient, sent_by,
    housitter:housitter_id ( first_name, last_name, id ),
    housitter_profile:housitter_id ( avatar_url ),
    landlord:landlord_id ( first_name, last_name, id ),
    landlord_profile:landlord_id ( avatar_url )`
        )
        .eq(currentUserType === UserType.Landlord ? 'landlord_id' : 'housitter_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error(`error loading inbox data: ${error.message}`)
        throw error
      } else if (data) {
        setMessages(data)
      }
    }

    loadInboxData()
  }, [user, currentUserType, usersContacted, chatWithUser])

  return (
    <NavDropdown
      title={
        <div style={{ display: 'inline-flex', alignItems: 'center' }}>
          <FontAwesomeIcon
            icon={faEnvelopeOpenText}
            style={{ marginRight: '10px', marginLeft: '5px' }}
          />
          Inbox
          <Badge pill bg="primary" style={{ marginLeft: '5px' }}>
            {
              messages.filter((m) => !m.is_read_by_recipient && m.sent_by !== currentUserType)
                .length
            }
          </Badge>
        </div>
      }
      id="basic-nav-dropdown"
    >
      {messages.length === 0 ? (
        <NavDropdown.Item disabled>
          There are currently no messaegs in your inbox.
          <br /> Try contacting someone! &#x1F642;
        </NavDropdown.Item>
      ) : (
        Object.keys(
          groupByKey(messages, currentUserType === 'landlord' ? 'housitter_id' : 'landlord_id')
        ).map((recipientId) => (
          <NavDropdown.Item key={recipientId} onClick={() => setChatWithUser(recipientId)}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                minWidth: '0',
              }}
              key={recipientId}
            >
              <img
                src={getUrlFromSupabase(
                  messages.find((m) => m[oppositeType(currentUserType)].id === recipientId)[
                    `${oppositeType(currentUserType)}_profile`
                  ].avatar_url,
                  'avatars'
                )}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 1000,
                }}
              />

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  paddingLeft: '1rem',
                }}
              >
                <div>
                  {
                    messages.find((m) => m[oppositeType(currentUserType)].id === recipientId)?.[
                      oppositeType(currentUserType)
                    ].first_name
                  }{' '}
                  {
                    messages.find((m) => m[oppositeType(currentUserType)].id === recipientId)?.[
                      oppositeType(currentUserType)
                    ].last_name
                  }
                  <Badge pill bg="primary" style={{ marginLeft: '10px' }}>
                    {messages.filter(
                      (m) =>
                        m[oppositeType(currentUserType)].id === recipientId &&
                        !m.is_read_by_recipient &&
                        m.sent_by !== currentUserType
                    ).length || null}
                  </Badge>
                </div>

                <div
                  style={{
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    maxWidth: '10rem',
                    color: 'darkgray',
                  }}
                >
                  {
                    messages
                      .filter((m) => m[oppositeType(currentUserType)].id === recipientId)
                      .sort((a, b) => a.a < b.a)[0].message_content
                  }
                </div>
              </div>
            </div>
          </NavDropdown.Item>
        ))
      )}
      <ChatModal recipientId={chatWithUser} update={setChatWithUser} />
    </NavDropdown>
  )
}
