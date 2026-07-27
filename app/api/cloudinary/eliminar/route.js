import crypto from 'crypto';

// Borra un asset de Cloudinary. Requiere firma porque el preset de subida es "unsigned"
// y Cloudinary no permite borrar assets sin una petición firmada con el API Secret.
export async function POST(request) {
  const { publicId } = await request.json();

  if (!publicId) {
    return Response.json({ error: 'Falta publicId' }, { status: 400 });
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const timestamp = Math.floor(Date.now() / 1000);

  const signature = crypto
    .createHash('sha1')
    .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');

  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: timestamp.toString(),
    api_key: apiKey,
    signature,
  });

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    const data = await res.json();

    if (data.result !== 'ok' && data.result !== 'not found') {
      console.error('Cloudinary destroy error:', data);
      return Response.json({ error: 'No se pudo eliminar la imagen' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar imagen de Cloudinary:', error);
    return Response.json({ error: 'Error al eliminar la imagen' }, { status: 500 });
  }
}
