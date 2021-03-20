import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import cors from '@middy/http-cors'
import { createLogger } from '../../utils/logger'
import { generatePresignedUrl } from '../../businessLogic/todos'

const logger = createLogger('generateUploadUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId

    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const presignedUrl = generatePresignedUrl(todoId)

    logger.info('generated presigned url')

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl: presignedUrl })
    }
  }
)

handler.use(cors({ credentials: true }))
