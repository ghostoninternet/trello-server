import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'
import ApiError from '~/utils/ApiError'

const isAuthorized = async (req, res, next) => {
  const clientAccessToken = req.cookies?.accessToken
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthroized! (Token not found)'))
    return
  }

  try {
    // Step 1: Decode token
    const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)

    // Step 2: Save decoded data to request
    req.jwtDecoded = accessTokenDecoded

    // Step 3: Allow request continue to be processed
    next()
  } catch (error) {
    // If accessToken is expired, make sure to return correctly error status code (410)
    // so that FE will know to call refreshToken API
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token.'))
      return
    }

    // If accessToken is invalid, return 401 Unauthorized
    // so that FE will call logout API
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthroized!'))
    return
  }
}

export const authMiddleware = { isAuthorized }