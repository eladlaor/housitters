import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import HousePreview from './HousePreview'
import { createMockRouter } from '../test-utils/mockRouter'
import * as nextRouter from 'next/router'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

const mockStore = configureMockStore()
const store = mockStore({
  user: {
    isOngoingOAuth: false,
    firstName: 'Test',
    lastName: 'User',
    username: 'testuser',
    primaryUse: 'Test Use',
    avatarUrl: 'http://example.com/avatar.jpg',
    birthday: new Date(0).toISOString(),
    gender: 'Unknown',
    email: 'test@example.com',
    availability: [
      {
        startDate: new Date().toISOString(),
        endDate: new Date(0).toISOString(),
      },
    ],
    usersContacted: [],
  },
})

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: { avatar_url: 'avatarUrl' }, error: null }),
  }),
}))

jest.mock('@supabase/auth-helpers-react', () => ({
  useSessionContext: jest.fn(() => ({ isLoading: false })),
  useUser: jest.fn(() => ({ id: 'user123' })),
  useSupabaseClient: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: { avatar_url: 'avatarUrl' }, error: null }),
  }),
}))

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: any) => key,
  }),
}))

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

describe('HousePreview component', () => {
  beforeEach(() => {
    const mockRouter = createMockRouter({})
    jest.spyOn(nextRouter, 'useRouter').mockReturnValue(mockRouter)
  })

  const defaultProps = {
    landlordId: '123',
    title: 'Test House',
    location: 'Test Location',
    dogs: 2,
    cats: 1,
    imagesUrls: [{ id: 1, url: 'imageUrl' }],
    duration: 5,
    dateRanges: [{ startDate: '2021-01-01', endDate: '2021-01-06' }],
  }

  it('renders without crashing', async () => {
    await waitFor(() => {
      render(
        <Provider store={store}>
          <HousePreview {...defaultProps} />
        </Provider>
      )
    })
    expect(screen.getByText('Test House')).toBeInTheDocument()
  })
})
