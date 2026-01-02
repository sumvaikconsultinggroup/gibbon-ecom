import nodemailer from 'nodemailer'

const mailer = async (options) => {
  // 1. Create a transporter using your email service credentials
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  // 2. Define the email options
  const mailOptions = {
    from: 'Gibbon Admin <noreply@gibbon.com>',
    to: options.email,
    subject: options.subject,
    html: options.html,
  }

  // 3. Actually send the email
  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('There was an error sending the email. Please try again later.')
  }
}

export default mailer
