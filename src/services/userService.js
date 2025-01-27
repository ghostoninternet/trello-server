import { StatusCodes } from 'http-status-codes'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { pickUser } from '~/utils/formatter'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'

const createNew = async (reqBody) => {
  try {
    // Check email has exist
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!')
    }

    // Create new user data to insert
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password),
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4()
    }

    // Insert new user to Database
    const createUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createUser.insertedId)

    // Send email for new account verification
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'Trello MERN Stack Advanced: Please verify your email before using our services!'
    const htmlContent = `
      <h3>Here is your verification link</h3>
      <h3>${verificationLink}</h3>
      <h3>Sincerely, <br/> - Phuc Dao - </h3>
    `
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)

    // Return data
    return pickUser(getNewUser)
  } catch (error) { throw error }
}

export const userService = {
  createNew
}