import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as middy from 'middy'
import cors from '@middy/http-cors'
import { getUserId } from '../utils'

const docClient = new DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    // TODO: Remove a TODO item by id
    await docClient
      .delete({
        TableName: todosTable,
        Key: {
          todoId,
          userId
        }
      })
      .promise()

    return {
      statusCode: 200,
      body: JSON.stringify({})
    }
  }
)

handler.use(cors({ credentials: true }))
