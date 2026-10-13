import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/context/AuthContext';
import { InterConnectProvider } from '@/lib/context/InterConnectContext';

export const metadata: Metadata = {
  title: 'InterConnect | Where Talent Meets Opportunity',
  description:
    'The premier ecosystem connecting ambitious university students with forward-thinking companies through intelligent internship matching, transparent application tracking, and direct recruiter conversations.',
  keywords: [
    'internships',
    'student recruitment',
    'software engineering interns',
    'college career platform',
    'smart talent matching',
  ],
  authors: [{ name: 'InterConnect' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-canvas text-brand-text antialiased selection:bg-brand-tint selection:text-brand-navy">
        <AuthProvider>
          <InterConnectProvider>
            {children}
          </InterConnectProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
