// https://github.com/getbrevo/brevo-node
const brevo = require('@getbrevo/brevo')
import { env } from '~/config/environment'

let apiInstance = new brevo.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (recipientEmail, customSubject, htmlContent) => {
  // Init sendSmtpMail instance with neccessary information
  let sendSmtpEmail = new brevo.SendSmtpEmail()

  // Send email account aka admin email
  sendSmtpEmail.sender = { email: env.ADMIN_EMAIL_ADDRESS, name: env.ADMIN_EMAIL_NAME }

  // Recive emails account
  // sendSmtpEmail.to is an array so we can be flexible in sending email to one user or to many users
  sendSmtpEmail.to = [{ email: recipientEmail }]

  // Email subject
  sendSmtpEmail.subject = customSubject

  // Email html content
  sendSmtpEmail.htmlContent = htmlContent

  // Call send email action
  return apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const BrevoProvider = {
  sendEmail
}