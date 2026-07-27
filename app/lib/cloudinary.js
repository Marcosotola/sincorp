// lib/cloudinary.js
// Subida de imágenes directo desde el navegador a Cloudinary usando un upload preset "unsigned".

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

// Devuelve { promise, xhr } para poder mostrar progreso y permitir cancelar la subida.
export const subirImagenACloudinary = (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const xhr = new XMLHttpRequest();
  xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

  const promise = new Promise((resolve, reject) => {
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url: data.secure_url,
          publicId: data.public_id,
          width: data.width,
          height: data.height,
        });
      } else {
        reject(new Error('No se pudo subir la imagen a Cloudinary'));
      }
    };

    xhr.onerror = () => reject(new Error('Error de red al subir la imagen'));
    xhr.onabort = () => reject(new Error('Subida cancelada'));

    xhr.send(formData);
  });

  return { promise, xhr };
};

// Borra el asset en Cloudinary a través de nuestra API route (necesita firmar con el API Secret).
export const eliminarImagenDeCloudinary = async (publicId) => {
  const res = await fetch('/api/cloudinary/eliminar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId }),
  });

  if (!res.ok) {
    throw new Error('No se pudo eliminar la imagen de Cloudinary');
  }
};
