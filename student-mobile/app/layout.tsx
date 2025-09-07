import './globals.css';
import ServiceWorkerRegistration from './sw-register';

export const metadata = {
  title: 'Student App - Campus Events',
  description: 'Browse and register for campus events',
  manifest: '/manifest.json',
  themeColor: '#6366f1',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Campus Events',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Campus Events" />
      </head>
      <body>
        {/* Clean Mobile Header */}
        <header className="mobile-header">
          <h1 className="text-2xl font-bold text-gray-800">🎓 Student Portal</h1>
          <p className="text-sm text-gray-600 mt-2">Campus Event Management</p>
        </header>

        <main className="mobile-container">{children}</main>

        {/* Clean Mobile Navigation */}
        <nav className="mobile-nav">
          <div className="flex justify-around">
            <a href="/" className="mobile-nav-item">
              <div className="text-2xl mb-1">🏠</div>
              <span className="text-xs">Home</span>
            </a>
            <a href="/events" className="mobile-nav-item">
              <div className="text-2xl mb-1">🎉</div>
              <span className="text-xs">Events</span>
            </a>
            <a href="/my-events" className="mobile-nav-item">
              <div className="text-2xl mb-1">📋</div>
              <span className="text-xs">My Events</span>
            </a>
            <a href="/attendance" className="mobile-nav-item">
              <div className="text-2xl mb-1">✅</div>
              <span className="text-xs">Attendance</span>
            </a>
            <a href="/feedback" className="mobile-nav-item">
              <div className="text-2xl mb-1">💬</div>
              <span className="text-xs">Feedback</span>
            </a>
          </div>
        </nav>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}

