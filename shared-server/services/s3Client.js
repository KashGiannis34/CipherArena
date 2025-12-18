import { S3Client } from '@aws-sdk/client-s3';

let client;

export function getS3Client() {
	if (!client) {
		client = new S3Client({
			region: process.env.AWS_REGION,
			credentials: {
				accessKeyId: process.env.S3_ACCESS_KEY_ID,
				secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
			}
		});
	}
	return client;
}
