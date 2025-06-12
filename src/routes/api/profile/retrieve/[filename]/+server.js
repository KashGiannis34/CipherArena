import { getS3Client } from '$db/s3Client';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { error, json } from '@sveltejs/kit';

export async function GET({ params }) {
	const s3 = getS3Client();
	const { filename } = params;

	if (!filename) {
		throw error(400, 'Missing filename');
	}

	const command = new GetObjectCommand({
		Bucket: process.env.S3_BUCKET_NAME,
		Key: `profilePictures/${filename}`
	});

	try {
		const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 }); // 5 minutes
		return json({success: true, url: signedUrl });
	} catch (err) {
		console.error('Failed to generate signed URL:', err);
		return json({success: false, error: 'Failed to retrieve profile picture.'}, {status: 500});
	}
}