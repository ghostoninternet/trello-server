import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardValidation } from '~/validations/boarrdValidation'
import { boardController } from '~/controllers/boardController'
const Router = express.Router()

Router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'API get list boards' })
  })
  .post(boardValidation.createNew, boardController.createNew)

export const boardRoute = Router