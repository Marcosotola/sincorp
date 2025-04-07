'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';

export default function Contacto() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitError(false);

    // Simulación de envío de formulario
    try {
      // Aquí iría la lógica real de envío (API, Firebase, etc)
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSubmitMessage('¡Mensaje enviado correctamente! Nos pondremos en contacto pronto.');
      setFormData({ nombre: '', email: '', telefono: '', mensaje: '' });
    } catch (error) {
      setSubmitError(true);
      setSubmitMessage('Ocurrió un error al enviar el mensaje. Por favor, intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="bg-primary text-white py-22">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-montserrat font-bold mb-4">Contacto</h1>
          <p className="text-xl max-w-2xl">
            Estamos aquí para responder sus consultas y brindarle la mejor solución para sus necesidades técnicas.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-2xl font-montserrat font-bold mb-6 text-primary">Envíenos un mensaje</h2>

            {submitMessage && (
              <div className={`p-4 mb-6 rounded-md ${submitError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {submitMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="nombre" className="block mb-2 font-medium">Nombre completo</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block mb-2 font-medium">Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="telefono" className="block mb-2 font-medium">Teléfono</label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="mensaje" className="block mb-2 font-medium">Mensaje</label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  rows={5}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-white px-6 py-3 rounded-md font-medium flex items-center justify-center hover:bg-primary-light transition-colors disabled:opacity-70"
              >
                {isSubmitting ? 'Enviando...' : (
                  <>
                    Enviar mensaje
                    <Send size={18} className="ml-2" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-2xl font-montserrat font-bold mb-6 text-primary">Información de contacto</h2>

            <div className="space-y-6">
              <div className="flex items-start">
                <Phone className="text-primary mr-4 mt-1" />
                <div>
                  <h3 className="font-medium">Teléfono</h3>
                  <p className="text-gray-600">(011) 1234-5678</p>
                  <p className="text-gray-600">+54 9 11 1234-5678 (WhatsApp)</p>
                </div>
              </div>

              <div className="flex items-start">
                <Mail className="text-primary mr-4 mt-1" />
                <div>
                  <h3 className="font-medium">Correo electrónico</h3>
                  <p className="text-gray-600">info@sincorp.com.ar</p>
                  <p className="text-gray-600">soporte@sincorp.com.ar</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="text-primary mr-4 mt-1" />
                <div>
                  <h3 className="font-medium">Dirección</h3>
                  <p className="text-gray-600">Av. Rivadavia 1234</p>
                  <p className="text-gray-600">Buenos Aires, Argentina</p>
                </div>
              </div>
            </div>

            <div className="flex item-start mt-8">
              <Clock className="text-primary mr-4 mt-1" />
              <div>
                <h3 className="font-medium mb-3">Horario de atención</h3>
                <p className="text-gray-600">Lunes a Viernes: 8:00 - 18:00</p>
                <p className="text-gray-600">Sábados: 9:00 - 13:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}