import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import cors from '@middy/http-cors'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generateUploadUrl')

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

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

const generatePresignedUrl = (todoId: string) => {
  return s3.getSignedUrl('putObject', {
    // The URL will allow to perform the PUT operation
    Bucket: bucketName, // Name of an S3 bucket
    Key: todoId, // id of an object this URL allows access to
    Expires: urlExpiration // A URL is only valid for 5 minutes
  })
}
