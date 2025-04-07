import './globals.css';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import WhatsAppBadge from './components/ui/WhatsAppBadge';

export const metadata = {
  title: 'Sincorp - Servicios Integrales',
  description: 'Servicios técnicos profesionales en Automatismo, Electricidad, Climatización y Seguridad',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="flex flex-col min-h-screen">
        <Header/>

        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <WhatsAppBadge phoneNumber="+5493516810777" />
      </body>
    </html>
  );
}