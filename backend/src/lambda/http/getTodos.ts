import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import cors from '@middy/http-cors'
import { getUserId } from '../utils'
import { getAllTodos } from '../../businessLogic/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Get all TODO items for a current user
    const userId = getUserId(event)

    const todos = await getAllTodos(userId)

    return {
      statusCode: 200,
      body: JSON.stringify({ items: todos })
    }
  }
)

handler.use(cors({ credentials: true }))
