import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// CLOUDINARY_URL di environment variable otomatis dibaca oleh SDK ini,
// tidak perlu cloudinary.config() manual.

export const runtime = 'nodejs';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: 'userId tidak ditemukan' }, { status: 400 });
    }

    // Validasi tipe file (cuma gambar)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File harus berupa gambar' }, { status: 400 });
    }

    // Validasi ukuran file (maks 5MB)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json({ error: 'Ukuran file maksimal 5MB' }, { status: 400 });
    }

    // Convert File -> Buffer -> base64 data URI supaya bisa di-upload via SDK
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'quizfrend/avatars',
      public_id: `user_${userId}`,
      overwrite: true,
      resource_type: 'image',
      transformation: [
        { width: 512, height: 512, crop: 'fill', gravity: 'face' },
      ],
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error('Upload avatar error:', error);
    return NextResponse.json(
      { error: 'Gagal mengupload foto profil' },
      { status: 500 }
    );
  }
}
