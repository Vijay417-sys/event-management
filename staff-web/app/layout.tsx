import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Staff Portal - Campus Event Management',
  description: 'Manage campus events, track attendance, and view reports',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-white/95 backdrop-blur-sm shadow-xl border-b border-gray-200 sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <Link href="/" className="text-2xl font-bold text-gradient hover:scale-105 transition-transform">
                👨‍🏫 Staff Portal
              </Link>
              <div className="flex space-x-8">
                <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 font-semibold transition-all duration-200 hover:scale-105">
                  <span className="text-xl">🏠</span><span>Dashboard</span>
                </Link>
                <Link href="/events" className="flex items-center space-x-2 text-gray-600 hover:text-green-600 font-semibold transition-all duration-200 hover:scale-105">
                  <span className="text-xl">📅</span><span>Manage Events</span>
                </Link>
                <Link href="/reports" className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 font-semibold transition-all duration-200 hover:scale-105">
                  <span className="text-xl">📊</span><span>Reports</span>
                </Link>
                <Link href="/feedback" className="flex items-center space-x-2 text-gray-600 hover:text-yellow-600 font-semibold transition-all duration-200 hover:scale-105">
                  <span className="text-xl">📝</span><span>Feedback</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="animate-fade-in">{children}</main>
      </body>
    </html>
  );
}
