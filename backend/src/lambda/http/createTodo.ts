import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { v4 as uuidv4 } from 'uuid'

const docClient = new DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const parsedBody: CreateTodoRequest = JSON.parse(event.body)

  // TODO: Implement creating a new TODO item
  const todoId: string = uuidv4()

  const newTodo = {
    id: todoId,
    ...parsedBody,
    done: false
  }

  await docClient
    .put({
      TableName: todosTable,
      Item: newTodo
    })
    .promise()

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(newTodo)
  }
}
