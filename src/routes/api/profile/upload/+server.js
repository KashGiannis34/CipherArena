import { getS3Client } from '$lib/server/s3Client';
import {PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { UserGame } from '$db/models/UserGame.js';
import { json } from '@sveltejs/kit';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '$db/auth/authenticate.js';

export async function POST({ request, cookies }) {
  const auth = await authenticate(cookies.get('auth-token'));
  if (!auth) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const s3 = getS3Client();
	const formData = await request.formData();
	const file = formData.get('profilePicture');

	if (!file || typeof file !== 'object') {
		return json({ success: false, error: 'No file uploaded.' }, { status: 400 });
	}

	if (!file.type?.startsWith('image/')) {
		return json({ success: false, error: 'Invalid file type. Must be an image.' }, { status: 415 });
	}

	try {
		const buffer = Buffer.from(await file.arrayBuffer());

		const originalName = file.name || 'image.png';
		const ext = originalName.includes('.') ? originalName.split('.').pop() : 'png';
		const filename = `${uuidv4()}.${ext}`;

		await s3.send(new PutObjectCommand({
			Bucket: process.env.S3_BUCKET_NAME,
			Key: `profilePictures/${filename}`,
			Body: buffer,
			ContentType: file.type,
			ACL: 'private'
		}));

    const oldPfp = await UserGame.findById(auth.id).select('profilePicture').lean();

    const user = await UserGame.findByIdAndUpdate(auth.id, { profilePicture: filename });

    if (oldPfp?.profilePicture && oldPfp.profilePicture !== 'default') {
      const oldPfpPath = `profilePictures/${oldPfp.profilePicture}`;
      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: oldPfpPath
      }));
    }

		return json({ success: true});
	} catch (err) {
		console.error('S3 upload error:', err);
		return json({ success: false, error: 'Upload failed. Please try again.' }, { status: 500 });
	}
}