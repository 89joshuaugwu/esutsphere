import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "dls1uradw";
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || "esutsphere";
    
    formData.append('upload_preset', uploadPreset);

    const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await cloudinaryRes.json();

    if (!cloudinaryRes.ok) {
      return NextResponse.json({ error: data.error?.message || 'Cloudinary upload failed' }, { status: cloudinaryRes.status });
    }

    return NextResponse.json({ url: data.secure_url, format: data.format, bytes: data.bytes });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
