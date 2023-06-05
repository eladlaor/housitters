// import { createClient } from '@supabase/supabase-js'
import * as nodemailer from 'nodemailer'

const sendGridApiKey = process.env.SENDGRID_API_KEY || ''

const sendEmail = async (
  recipientEmail: string,
  senderFirstName: string,
  senderLastName: string,
  message: string
) => {
  // Configure Nodemailer with SendGrid transport
  const transporter = nodemailer.createTransport({
    service: 'SendGrid',
    auth: {
      user: 'apikey',
      pass: sendGridApiKey,
    },
  })

  // Compose the email message
  const mailOptions = {
    from: 'eladlaor88@gmail.com', // TODO: must change this to be from 'housitters.com'
    to: recipientEmail,
    subject: `You got a new message from ${senderFirstName} ${senderLastName}`,
    text: message,
  }

  try {
    // Send the email using Nodemailer

    console.log(`sending this email: to - ${recipientEmail}.  text: ${message}`)

    await transporter.sendMail(mailOptions)
    console.log('Email sent successfully')
  } catch (error) {
    console.error('Error sending email:', error)
  }
}

export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    console.log('reached post handler')
    try {
      const { recipientEmail, senderFirstName, senderLastName, message } = req.body

      // sending email using Nodemailer and SendGrid
      await sendEmail(recipientEmail, senderFirstName, senderLastName, message)

      return res.status(200).json({ message: 'Email sent successfully' })
    } catch (error) {
      console.error('Error:', error)
      return res.status(500).json({ error: 'Error sending email' })
    }
  }
}
