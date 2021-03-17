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
    // TODO: Get all TODO items for a current user
    const userId = getUserId(event)

    const result = await docClient
      .query({
        TableName: todosTable,
        KeyConditionExpression: 'UserId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    const items = result.Items

    return {
      statusCode: 200,
      body: JSON.stringify(items)
    }
  }
)

handler.use(cors({ credentials: true }))
