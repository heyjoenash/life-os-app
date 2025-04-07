import Link from 'next/link';

export const metadata = {
  title: 'Life OS - Your Personal Productivity Dashboard',
  description: 'Organize your digital life with Life OS',
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-center text-primary-600">Life OS</h1>
          <p className="mt-3 text-center text-gray-600">
            Your personal productivity and AI-assisted dashboard
          </p>
        </div>
        <div className="mt-8 bg-white p-8 shadow rounded-lg">
          <p className="text-gray-700 mb-6">
            Welcome to Life OS, where each day serves as a hub for your activities, communications,
            and data.
          </p>

          <div className="space-y-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/day"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go to Today
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
