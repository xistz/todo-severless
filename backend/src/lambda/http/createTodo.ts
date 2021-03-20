import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import cors from '@middy/http-cors'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
import { createTodo } from '../../businessLogic/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const parsedBody: CreateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    // TODO: Implement creating a new TODO item
    const newTodo = await createTodo(parsedBody, userId)

    return {
      statusCode: 201,
      body: JSON.stringify({ item: newTodo })
    }
  }
)

handler.use(cors({ credentials: true }))
