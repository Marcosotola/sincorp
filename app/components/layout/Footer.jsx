import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-montserrat font-bold mb-4">SINCORP</h3>
            <p className="mb-4">Servicios técnicos profesionales en Automatismo, Electricidad, Climatización y Seguridad.</p>
            <div className="flex items-center mb-2">
              <Phone size={16} className="mr-2" />
              <span>(011) 1234-5678</span>
            </div>
            <div className="flex items-center mb-2">
              <Mail size={16} className="mr-2" />
              <span>info@sincorp.com.ar</span>
            </div>
            <div className="flex items-start mb-2">
              <MapPin size={16} className="mr-2 mt-1" />
              <span>Av. Rivadavia 1234, Buenos Aires, Argentina</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xl font-montserrat font-bold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-gray-300">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/servicios" className="hover:text-gray-300">
                  Servicios
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="hover:text-gray-300">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-gray-300">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-montserrat font-bold mb-4">Servicios</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/servicios/automatismo" className="hover:text-gray-300">
                  Automatismo
                </Link>
              </li>
              <li>
                <Link href="/servicios/electricidad" className="hover:text-gray-300">
                  Electricidad
                </Link>
              </li>
              <li>
                <Link href="/servicios/climatizacion" className="hover:text-gray-300">
                  Climatización
                </Link>
              </li>
              <li>
                <Link href="/servicios/seguridad" className="hover:text-gray-300">
                  Seguridad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-8 pt-6 text-center">
          <p>&copy; {new Date().getFullYear()} SINCORP. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;