import { Button, Modal, Badge, Col, Row, Spinner } from 'react-bootstrap'
import { useRouter } from 'next/router'
import Card from 'react-bootstrap/Card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCat, faDog } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import React from 'react'
import ContactFoundUser from './Contact/ContactFoundUser'
import { LocationDescriptions } from '../utils/constants'
import { HousePreviewProps } from '../types/clientSide'

import { getUrlFromSupabase, handleError } from '../utils/helpers'
import { useTranslation } from 'react-i18next'

export default function HousePreview({
  landlordId,
  title,
  location,
  dogs,
  cats,
  imagesUrls,
  duration,
  dateRanges,
}: HousePreviewProps) {
  const supabaseClient = useSupabaseClient()
  const router = useRouter()
  const { t } = useTranslation()

  const [landlordAvatarUrl, setLandlordAvatarUrlState] = useState('')

  useEffect(() => {
    if (landlordId) {
      const loadData = async () => {
        let profilesQuery = await supabaseClient
          .from('profiles')
          .select(`avatar_url`)
          .eq('id', landlordId)
          .single()

        const { error, data } = await profilesQuery
        if (error) {
          return handleError(error.message, 'HousePreview.useEffect')
        }

        if (data) {
          setLandlordAvatarUrlState(data.avatar_url)
        }
      }

      loadData()
    }
  }, [landlordId])

  return (
    <Card className="house-preview">
      {landlordAvatarUrl ? (
        <Card.Img
          variant="top"
          src={
            imagesUrls[0]?.url
              ? getUrlFromSupabase(landlordId + '-' + imagesUrls[0]?.url, 'posts')
              : getUrlFromSupabase(landlordAvatarUrl, 'avatars')
          }
        />
      ) : (
        <Spinner />
      )}
      <div className="image-details">
        <Badge>{t(`sidebarFilter.location.descriptions.${LocationDescriptions[location]}`)}</Badge>
        <br />
        {!!dogs && (
          <Badge>
            <FontAwesomeIcon icon={faDog} /> {dogs}
          </Badge>
        )}

        {!!cats && (
          <Badge className="ms-1">
            <FontAwesomeIcon icon={faCat} /> {cats}
          </Badge>
        )}
        <br />
        {duration !== 0 && dateRanges.length > 0 && (
          <Badge>
            {dateRanges.length > 1
              ? t('houses.housePreview.multiplePeriods')
              : dateRanges[0].startDate}
          </Badge>
        )}
        {duration !== 0 && <br />}
        <Badge>
          {duration
            ? `${duration} ${t('houses.housePreview.days')}`
            : t('houses.housePreview.flexible')}
        </Badge>
      </div>
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Row className="mt-3">
          <Col xs={6}>
            <Button
              variant="outline-primary"
              size="sm"
              className="w-100"
              onClick={() => {
                router.push(`/houses/${landlordId}`)
              }}
            >
              {t('houses.housePreview.details')}
            </Button>
          </Col>
          <Col xs={6}>
            <ContactFoundUser size="sm" className="w-100" recipientUserId={landlordId} />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}
