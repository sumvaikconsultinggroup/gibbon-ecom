import nodemailer from 'nodemailer'

function contactTemplate({ name, email, phone, message }) {
  return `
  <div style="
    font-family: 'Arial', sans-serif;
    background: #f9fafb;
    padding: 30px;
    color: #1f2937;
  ">
    <div style="
      max-width: 600px;
      margin: auto;
      background: #ffffff;
      border-radius: 12px;
      padding: 30px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 2px 12px rgba(0,0,0,0.04);
    ">
      
      <h2 style="
        margin: 0;
        margin-bottom: 20px;
        font-size: 22px;
        font-weight: 600;
        color: #111827;
        text-align: center;
      ">
        🌿 Gibbon Nutrients – New Contact Submission
      </h2>

      <p style="
        font-size: 15px;
        color: #6b7280;
        text-align: center;
        margin-bottom: 25px;
      ">
        A new inquiry has been received from the website.
      </p>

      <div style="
        border-top: 1px solid #e5e7eb;
        margin: 20px 0;
      "></div>

      <div style="font-size: 15px; line-height: 1.6;">

        <p>
          <strong style="color: #111827;">Name:</strong><br />
          <span style="color: #374151;">${name}</span>
        </p>

        <p>
          <strong style="color: #111827;">Email:</strong><br />
          <span style="color: #374151;">${email}</span>
        </p>

        <p>
          <strong style="color: #111827;">Phone:</strong><br />
          <span style="color: #374151;">${phone}</span>
        </p>

        <p>
          <strong style="color: #111827;">Message:</strong><br />
          <span style="
            display: block;
            margin-top: 6px;
            padding: 15px;
            background: #f3f4f6;
            border-radius: 8px;
            color: #374151;
            border: 1px solid #e5e7eb;
          ">
            ${message}
          </span>
        </p>

      </div>

      <div style="
        border-top: 1px solid #e5e7eb;
        margin: 25px 0 15px;
      "></div>

      <p style="
        font-size: 13px;
        color: #9ca3af;
        text-align: center;
      ">
        Gibbon Nutrients © All Rights Reserved
      </p>
    </div>
  </div>
  `
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // e.g., smtp.gmail.com
  port: process.env.SMTP_PORT, // e.g., 465 or 587
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER, // your email
    pass: process.env.SMTP_PASS, // your password/app password
  },
})

export async function POST(req) {
  try {
    const body = await req.json()
    const { name, email, phone, message } = body

    if (!name || !email || !message) {
      return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    await transporter.sendMail({
      from: `"Gibbon Nutrients" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_TO_EMAIL, // admin email
      subject: 'New Contact Form Message',
      html: contactTemplate({ name, email, phone, message }),
    })

    return Response.json({ success: true, message: 'Email sent successfully' })
  } catch (err) {
    console.error('MAIL ERROR:', err)
    return Response.json({ success: false, error: 'Failed to send email' }, { status: 500 })
  }
}
