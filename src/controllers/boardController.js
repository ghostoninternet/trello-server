import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'

const getBoards = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const { page, itemsPerPage, q } = req.query
    const queryFilter = q
    const results = await boardService.getBoards(userId, page, itemsPerPage, queryFilter)
    res.status(StatusCodes.OK).json(results)
  } catch (error) { next(error) }
}

const createNew = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    // Process data in Service layer
    const createdBoard = await boardService.createNew(req.body, userId)
    // Return result to FE
    res.status(StatusCodes.CREATED).json(createdBoard)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const userId = req.jwtDecoded._id
    // Process data in Service layer
    const board = await boardService.getDetails(boardId, userId)
    // Return result to FE
    res.status(StatusCodes.OK).json(board)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const updatedBoard = await boardService.update(boardId, req.body)
    // Return result to FE
    res.status(StatusCodes.OK).json(updatedBoard)
  } catch (error) { next(error) }
}

const moveCardToDifferenceColumn = async (req, res, next) => {
  try {
    const result = await boardService.moveCardToDifferenceColumn(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const boardController = {
  getBoards,
  createNew,
  getDetails,
  update,
  moveCardToDifferenceColumn
}