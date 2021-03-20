import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

import { createLogger } from '../utils/logger'

export class ImageAccess {
  constructor(
    private readonly s3 = createS3ServiceObject(),
    private readonly logger = (logGroup: string) => createLogger(logGroup),
    private readonly bucketName = process.env.IMAGES_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) {}

  generatePresignedUrl(todoId: string): string {
    this.logger('generatePresignedUrl').info('Generating presigned URL')

    return this.s3.getSignedUrl('putObject', {
      // The URL will allow to perform the PUT operation
      Bucket: this.bucketName, // Name of an S3 bucket
      Key: todoId, // id of an object this URL allows access to
      Expires: this.urlExpiration // A URL is only valid for 5 minutes
    })
  }
}

function createS3ServiceObject() {
  return new XAWS.S3({
    signatureVersion: 'v4'
  })
}
