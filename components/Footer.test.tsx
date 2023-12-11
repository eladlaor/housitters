import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Footer from './Footer'
import '@testing-library/jest-dom'
import axios from 'axios'

jest.mock('axios')

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: { email: 'test@example.com', first_name: 'John', last_name: 'Doe' },
              error: null,
            }),
        }),
      }),
    }),
  }),
}))

jest.mock('@supabase/auth-helpers-react', () => ({
  useUser: jest.fn().mockReturnValue({ id: 'user123' }),
  useSupabaseClient: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest
      .fn()
      .mockResolvedValue({
        data: { email: 'test@example.com', first_name: 'John', last_name: 'Doe' },
        error: null,
      }),
  }),
}))

describe('Footer component', () => {
  beforeEach(() => {
    ;(axios.post as jest.Mock).mockResolvedValue({ status: 200 })
  })

  it('renders without crashing and has Contact Us link', async () => {
    render(<Footer />)
    await waitFor(() => expect(screen.getByText('Contact Us')).toBeInTheDocument())
  })

  it('opens modal when Contact Us link is clicked', async () => {
    render(<Footer />)
    fireEvent.click(screen.getByText('Contact Us'))
    await waitFor(() =>
      expect(screen.getByText('your feedback is appreciated')).toBeInTheDocument()
    )
  })

  it('calls sendFeedbackEmail function on Send button click', async () => {
    window.alert = jest.fn()

    render(<Footer />)
    fireEvent.click(screen.getByText('Contact Us'))

    await waitFor(() => {
      const sendButton = screen.getByText('Send')
      fireEvent.click(sendButton)
      expect(axios.post).toHaveBeenCalled()
    })
  })
})
