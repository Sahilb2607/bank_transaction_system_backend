import "dotenv/config"
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
})

transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error)
  } else {
    console.log("Email server is ready to send messages")
  }
})

const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend-Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    })

    console.log("Message sent: %s", info.messageId)
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
  } catch (error) {
    console.error("Error sending email:", error)
  }
}
async function sendRegisterEmail(useremail, name) {
  const subject = "Welcome to Backend-Ledger!"
  const text = `Hi ${name},\n\nThank you for registering with Backend-Ledger. We're excited to have you on board! If you have any questions or need assistance, feel free to reach out to our support team.\n\nBest regards,\nThe Backend-Ledger Team`
  const html = `<p>Hi ${name},</p><p>Thank you for registering with Backend-Ledger. We're excited to have you on board! If you have any questions or need assistance, feel free to reach out to our support team.</p><p>Best regards,<br>The Backend-Ledger Team</p>`
  await sendEmail(useremail, subject, text, html)
}
async function sendSenderTransactionEmail(useremail, name, amount, from, to) {
  const subject = "Transaction Alert from Backend-Ledger"
  const text = `Hi ${name},\n\nA transaction of $${amount} has been made from account ${from} to account ${to}. If you did not authorize this transaction, please contact our support team immediately.\n\nBest regards,\nThe Backend-Ledger Team`
  const html = `<p>Hi ${name},</p><p>A transaction of $${amount} has been made from account ${from} to account ${to}. If you did not authorize this transaction, please contact our support team immediately.</p><p>Best regards,<br>The Backend-Ledger Team</p>`
  await sendEmail(useremail, subject, text, html)
}
async function sendReceiverTransactionEmail(useremail, name, amount, from, to) {
  const subject = "Transaction Alert from Backend-Ledger"
  const text = `Hi ${name},\n\nA transaction of $${amount} has been received in your account ${to} from account ${from}. If you did not expect this transaction, please contact our support team immediately.\n\nBest regards,\nThe Backend-Ledger Team`
  const html = `<p>Hi ${name},</p><p>A transaction of $${amount} has been received in your account ${to} from account ${from}. If you did not expect this transaction, please contact our support team immediately.</p><p>Best regards,<br>The Backend-Ledger Team</p>`
  await sendEmail(useremail, subject, text, html)
}
export {
  sendRegisterEmail,
  sendSenderTransactionEmail,
  sendReceiverTransactionEmail,
}
