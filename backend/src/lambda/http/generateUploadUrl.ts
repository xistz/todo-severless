import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as S3 from 'aws-sdk/clients/s3'
import * as middy from 'middy'
import cors from '@middy/http-cors'

const s3 = new S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId

    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const presignedUrl = s3.getSignedUrl('putObject', {
      // The URL will allow to perform the PUT operation
      Bucket: bucketName, // Name of an S3 bucket
      Key: todoId, // id of an object this URL allows access to
      Expires: urlExpiration // A URL is only valid for 5 minutes
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl: presignedUrl })
    }
  }
)

handler.use(cors({ credentials: true }))
