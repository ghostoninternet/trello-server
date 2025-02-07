import { cloneDeep } from 'lodash'
import { slugify } from '~/utils/formatter'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { ObjectId } from 'mongodb'
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from '~/utils/constants'

const getBoards = async (userId, page, itemsPerPage, queryFilter) => {
  try {
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE

    const results = await boardModel.getBoards(
      userId,
      parseInt(page, 10),
      parseInt(itemsPerPage, 10),
      queryFilter
    )
    return results
  } catch (error) { throw error }
}

const createNew = async (reqBody, userId) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }
    const createdBoard = await boardModel.createNew(newBoard, userId)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)
    return getNewBoard
  } catch (error) { throw error }
}

const getDetails = async (boardId, userId) => {
  try {
    const board = await boardModel.getDetails(boardId, userId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board does not exists!')
    }
    const resBoard = cloneDeep(board)
    resBoard.columns.forEach(column => {
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))
      // column.cards = resBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
    })
    delete resBoard.cards
    return resBoard
  } catch (error) { throw error }
}

const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedBoard = await boardModel.update(boardId, updateData)
    return updatedBoard
  } catch (error) { throw error }
}

const moveCardToDifferenceColumn = async (reqBody) => {
  try {
    // Step 1: Update cardOrderIds of Column that contains the card (Delete the card from cardOrderIds)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds.map(cardId => new ObjectId(cardId)),
      updatedAt: Date.now()
    })
    // Step 2: Update cardOrderIds of Column that will hold the new card (Add the card id into cardOrderIds)
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds.map(cardId => new ObjectId(cardId)),
      updatedAt: Date.now()
    })
    // Step 3: Update columnId field of the new card
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId
    })
    return { updateResult: 'Successfully' }
  } catch (error) { throw error }
}

export const boardService = {
  getBoards,
  createNew,
  getDetails,
  update,
  moveCardToDifferenceColumn
}