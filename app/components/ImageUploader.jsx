// components/ImageUploader.jsx
'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X, RotateCcw } from 'lucide-react';
import { subirImagenACloudinary, eliminarImagenDeCloudinary } from '../lib/cloudinary';

// imagenes: [{ url, publicId, width, height }]
// onChange recibe una función (prevImagenes => nuevasImagenes), igual que el setter funcional de useState,
// para evitar pisar imágenes que terminaron de subir mientras otras seguían en curso.
export default function ImageUploader({ imagenes = [], onChange }) {
  const inputRef = useRef(null);
  const [subiendo, setSubiendo] = useState([]); // [{ id, previewUrl, progress, error, xhr, file }]
  const [eliminando, setEliminando] = useState([]); // publicIds en proceso de borrado

  const iniciarSubida = (id, file, previewUrl) => {
    const { promise, xhr } = subirImagenACloudinary(file, (progress) => {
      setSubiendo((prev) => prev.map((s) => (s.id === id ? { ...s, progress } : s)));
    });

    setSubiendo((prev) => [...prev, { id, previewUrl, progress: 0, error: null, xhr, file }]);

    promise
      .then((resultado) => {
        setSubiendo((prev) => prev.filter((s) => s.id !== id));
        URL.revokeObjectURL(previewUrl);
        onChange((prev) => [...(prev || []), resultado]);
      })
      .catch((error) => {
        if (error.message === 'Subida cancelada') return;
        setSubiendo((prev) => prev.map((s) => (s.id === id ? { ...s, error: error.message } : s)));
      });
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    files.forEach((file) => {
      const id = `${Date.now()}-${Math.random()}`;
      const previewUrl = URL.createObjectURL(file);
      iniciarSubida(id, file, previewUrl);
    });
  };

  const cancelarSubida = (id) => {
    setSubiendo((prev) => {
      const item = prev.find((s) => s.id === id);
      if (item) {
        item.xhr.abort();
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((s) => s.id !== id);
    });
  };

  const reintentarSubida = (id) => {
    const item = subiendo.find((s) => s.id === id);
    if (!item) return;
    setSubiendo((prev) => prev.filter((s) => s.id !== id));
    iniciarSubida(id, item.file, item.previewUrl);
  };

  const eliminarImagen = async (publicId) => {
    setEliminando((prev) => [...prev, publicId]);
    try {
      await eliminarImagenDeCloudinary(publicId);
    } catch (error) {
      console.error('Error al eliminar imagen de Cloudinary:', error);
    } finally {
      setEliminando((prev) => prev.filter((id) => id !== publicId));
      onChange((prev) => (prev || []).filter((img) => img.publicId !== publicId));
    }
  };

  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-700">Fotos</label>

      <div className="flex flex-wrap gap-3">
        {imagenes.map((img) => {
          const borrando = eliminando.includes(img.publicId);
          return (
            <div key={img.publicId} className="relative w-24 h-24">
              <img
                src={img.url}
                alt=""
                className={`object-cover w-24 h-24 border border-gray-300 rounded-md ${borrando ? 'opacity-40' : ''}`}
              />
              {borrando ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/30">
                  <Loader2 className="text-white animate-spin" size={18} />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => eliminarImagen(img.publicId)}
                  className="absolute p-1 text-white bg-red-600 rounded-full shadow -top-2 -right-2 hover:bg-red-700"
                  title="Quitar foto"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          );
        })}

        {subiendo.map((s) => (
          <div key={s.id} className="relative w-24 h-24">
            <img
              src={s.previewUrl}
              alt=""
              className="object-cover w-24 h-24 border border-gray-300 rounded-md opacity-60"
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40">
              {s.error ? (
                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => reintentarSubida(s.id)}
                    className="p-1 text-white bg-blue-600 rounded-full hover:bg-blue-700"
                    title="Reintentar"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => cancelarSubida(s.id)}
                    className="text-[10px] text-white underline"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-xs font-semibold text-white">
                  <Loader2 className="animate-spin" size={18} />
                  {s.progress}%
                </div>
              )}
            </div>
            {!s.error && (
              <button
                type="button"
                onClick={() => cancelarSubida(s.id)}
                className="absolute p-1 text-white bg-gray-700 rounded-full shadow -top-2 -right-2 hover:bg-gray-800"
                title="Cancelar subida"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center w-24 h-24 gap-1 text-gray-500 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 hover:text-blue-500"
        >
          <ImagePlus size={20} />
          <span className="text-xs">Agregar</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />
    </div>
  );
}
