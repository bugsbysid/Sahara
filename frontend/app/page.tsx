'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/home');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Sahara</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Addressing India's
            <span className="text-blue-600"> Stray Dog Crisis</span>
          </h1>
          <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
            A unified platform for dog bite reporting, emergency response coordination, 
            and rabies prevention
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-2xl mx-auto mb-8">
            <p className="text-red-800 font-semibold">
              🚨 26.7 lakh dog bite cases in 2025
            </p>
            <p className="text-red-700 text-sm mt-1">
              Preventable rabies deaths due to fragmented reporting and poor coordination
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button className="px-8 py-3 text-lg">Report an Incident</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="px-8 py-3 text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-4xl mb-4">🆘</div>
            <h3 className="text-xl font-semibold mb-2">Instant Reporting</h3>
            <p className="text-gray-600">
              Report dog bite incidents immediately with GPS location and photos.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-4xl mb-4">🏥</div>
            <h3 className="text-xl font-semibold mb-2">Find Hospitals</h3>
            <p className="text-gray-600">
              Automatic discovery of nearby hospitals with anti-rabies vaccines.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Data-Driven Action</h3>
            <p className="text-gray-600">
              Identify hotspots and patterns for targeted interventions.
            </p>
          </div>
        </div>
    </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            © 2025 Sahara. Built with ❤️ to address India's stray dog crisis.
          </p>
        </div>
      </footer>
    </div>
  );
}
