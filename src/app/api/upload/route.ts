import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';
    
    let fileObj: any;
    let folder = 'uploads';
    let fileType = '';
    let fileSize = 0;

    if (contentType.includes('application/json')) {
      const body = await req.json();
      fileObj = body.file; // base64 string
      folder = body.folder || 'uploads';
      fileType = body.mimeType || 'image/jpeg';
      // Approximate base64 size: length * 0.75
      fileSize = fileObj ? fileObj.length * 0.75 : 0;
    } else {
      const formData = await req.formData();
      const f = formData.get('file') as File;
      fileObj = f;
      folder = formData.get('folder') as string || 'uploads';
      fileType = f?.type || 'image/jpeg';
      fileSize = f?.size || 0;
    }

    if (!fileObj) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Server-side validation
    const MAX_SIZE_MB = 10;
    if (fileSize > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json({ error: `File exceeds maximum size of ${MAX_SIZE_MB}MB` }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, WEBP, and MP4 are allowed.' }, { status: 400 });
    }

    // Upload to Cloudinary using unsigned preset via Fetch
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "yyfxsrjb";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'zzfkegyd';
    const resourceType = fileType.startsWith('video/') ? 'video' : 'image';
    
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
    
    const cloudinaryData = new FormData();
    cloudinaryData.append('file', fileObj);
    cloudinaryData.append('upload_preset', uploadPreset);
    cloudinaryData.append('folder', folder);

    const uploadRes = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: cloudinaryData,
    });

    if (!uploadRes.ok) {
      throw new Error(`Cloudinary upload failed: ${uploadRes.statusText}`);
    }

    const json = await uploadRes.json();
    return NextResponse.json({ url: json.secure_url }, { status: 200 });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file securely' }, { status: 500 });
  }
}
