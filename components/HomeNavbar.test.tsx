import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import HomeNavbar from './HomeNavbar'
import { RouterContext } from 'next/dist/shared/lib/router-context'
import { createMockRouter } from '../test-utils/mockRouter'
import * as nextRouter from 'next/router'
import * as reactI18next from 'react-i18next'

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnValue(Promise.resolve({ data: null, error: null })),
    upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
  }),
}))

jest.mock('@supabase/auth-helpers-react', () => ({
  useSessionContext: jest.fn(() => ({ isLoading: false })),
  useSupabaseClient: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnValue(Promise.resolve({ data: null, error: null })),
    upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
  }),
  useUser: jest.fn(() => ({ id: 'user123' })),
}))

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

jest.mock('react-redux', () => ({
  useSelector: jest.fn().mockReturnValue('Landlord'),
  useDispatch: () => jest.fn(),
}))

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: any) => {
      if (key === 'homeNavbar.language.hebrew') return 'עברית'
      return key
    },
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
}))

const mockRouter = createMockRouter({ locale: 'en' })
jest.spyOn(nextRouter, 'useRouter').mockReturnValue(mockRouter)

describe('HomeNavbar component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing and contains key elements', () => {
    render(
      <RouterContext.Provider value={mockRouter}>
        <HomeNavbar />
      </RouterContext.Provider>
    )
    expect(screen.getByText('Language')).toBeInTheDocument()
  })

  it('displays user-specific items when authenticated', () => {
    render(
      <RouterContext.Provider value={mockRouter}>
        <HomeNavbar />
      </RouterContext.Provider>
    )
    expect(screen.getByText('homeNavbar.favourites')).toBeInTheDocument()
  })

  it('handles locale change correctly', () => {
    render(
      <RouterContext.Provider value={mockRouter}>
        <HomeNavbar />
      </RouterContext.Provider>
    )

    const languageDropdownTrigger = screen.getByText('Language')
    fireEvent.click(languageDropdownTrigger)

    const hebrewOption = screen.getByText('עברית')
    fireEvent.click(hebrewOption)

    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: mockRouter.pathname,
        query: mockRouter.query,
      }),
      undefined,
      { locale: 'he' }
    )
  })
})
