import React from 'react'
import { render, screen } from '@testing-library/react'
import AvailableHousitter from './AvailableHousitter'
import { HousitterProps } from '../types/clientSide'
import '@testing-library/jest-dom'
import * as NextRouter from 'next/router'

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

jest.mock('react-redux', () => ({
  useSelector: jest.fn().mockReturnValue([]),
  useDispatch: jest.fn(() => jest.fn()),
}))

jest.mock('../utils/helpers', () => ({
  getURL: jest.fn(),
  getUrlFromSupabase: jest.fn().mockReturnValue('mockedImageUrl'),
  handleError: jest.fn(),
  truncateText: jest.fn().mockImplementation((text, maxLength) => ({
    truncatedText: text,
    wasTruncated: false,
  })),
}))

describe('AvailableHousitter component', () => {
  const mockProps: HousitterProps = {
    housitterId: '1',
    firstName: 'John',
    lastName: 'Doe',
    avatarUrl: 'avatar.jpg',
    experience: 5,
    aboutMeText:
      'now here is a story all about how my life got turned from upside down i tell you sit right right back and listen how i became the prince of a town called bell air',
  }

  beforeEach(() => {
    ;(NextRouter.useRouter as jest.Mock).mockImplementation(() => ({
      locale: 'en',
    }))
  })

  it('renders without crashing', () => {
    render(<AvailableHousitter {...mockProps} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('has a "Details" button', () => {
    render(<AvailableHousitter {...mockProps} />)
    expect(screen.getByText('housitterPreview.details')).toBeInTheDocument()
  })
})
