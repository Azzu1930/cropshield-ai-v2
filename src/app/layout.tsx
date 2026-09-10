import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { TopNav } from '@/components/TopNav';
import { BottomNav } from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'CropShield AI — Smarter Insights. Healthier Crops.',
  description:
    'Intelligent agricultural decision support platform for farmers with low digital literacy. Automatic weather detection, crop health diagnosis, and agronomic care.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col font-sans selection:bg-emerald-200">
        <AuthProvider>
          <LanguageProvider>
            <TopNav />
            <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
              {children}
            </main>
            <BottomNav />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
