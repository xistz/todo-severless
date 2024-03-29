import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as middy from 'middy'
import cors from '@middy/http-cors'
import { getUserId } from '../utils'
import { updateTodo } from '../../businessLogic/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)

    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    await updateTodo(todoId, userId, updatedTodo)

    return {
      statusCode: 200,
      body: JSON.stringify({})
    }
  }
)

handler.use(cors({ credentials: true }))
