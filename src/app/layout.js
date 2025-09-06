import { Plus_Jakarta_Sans } from 'next/font/google';
import { AuthProvider } from '@/hooks/useAuth';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import { ConfirmProvider } from '@/components/ui/ConfirmDialog';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
});

export const metadata = {
  title: 'English Classes and Exercises Manager',
  description:
    'A simple and efficient platform for English teachers to create and manage exercises for their students.',
  keywords: [
    'english',
    'exercises',
    'education',
    'teacher',
    'students',
    'learning',
  ],
  authors: [{ name: 'English Exercises Team' }],
  creator: 'English Classes and Exercises Manager',
  publisher: 'English Classes and Exercises Manager',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com',
    title: 'English Classes and Exercises Manager',
    description:
      'A simple and efficient platform for English teachers to create and manage exercises for their students.',
    siteName: 'English Classes and Exercises Manager',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'English Classes and Exercises Manager',
    description:
      'A simple and efficient platform for English teachers to create and manage exercises for their students.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${plusJakarta.className} antialiased`}>
        <AuthProvider>
          <ToastProvider>
            <ConfirmProvider>{children}</ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
