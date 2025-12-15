import { getS3Client } from '$db/s3Client';
import {PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { UserGame } from '$dbutils/UserGame.js';
import { json } from '@sveltejs/kit';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '$dbutils/authenticate.js';
import sharp from 'sharp';

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

	const MAX_SIZE_MB = 5;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
        return json({ success: false, error: `File size must be less than ${MAX_SIZE_MB}MB.` }, { status: 413 });
    }

	try {
		const originalBuffer = Buffer.from(await file.arrayBuffer());
		const compressedBuffer = await sharp(originalBuffer)
            .resize({
                width: 512,
                height: 512,
                fit: 'inside',
                withoutEnlargement: true,
            })
            .webp({ quality: 80 })
            .toBuffer();

		const filename = `${uuidv4()}.webp`;

		await s3.send(new PutObjectCommand({
			Bucket: process.env.S3_BUCKET_NAME,
			Key: `profilePictures/${filename}`,
			Body: compressedBuffer,
			ContentType: "image/webp",
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