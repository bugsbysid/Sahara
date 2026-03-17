'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">YourApp</h1>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/profile" className="text-gray-700 hover:text-gray-900">
                  {user?.name}
                </Link>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Sahara
            </h2>
            <p className="text-gray-600 mb-6">
              {user?.role === 'citizen' 
                ? 'Report dog bite incidents and track your treatment progress.'
                : user?.role === 'hospital'
                ? 'Manage assigned incidents and patient records.'
                : user?.role === 'animal_control'
                ? 'Monitor incidents in your jurisdiction and coordinate interventions.'
                : user?.role === 'ngo'
                ? 'Support rescue operations and coordinate with hospitals.'
                : 'View system-wide analytics and manage the platform.'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <strong>Name:</strong> {user?.name}
                  </p>
                  <p className="text-gray-600">
                    <strong>Email:</strong> {user?.email}
                  </p>
                  <p className="text-gray-600">
                    <strong>Role:</strong> <span className="capitalize">{user?.role.replace('_', ' ')}</span>
                  </p>
                  {user?.organization && (
                    <p className="text-gray-600">
                      <strong>Organization:</strong> {user.organization}
                    </p>
                  )}
                  {user?.jurisdiction && (
                    <p className="text-gray-600">
                      <strong>Jurisdiction:</strong> {user.jurisdiction}
                    </p>
                  )}
                  <p className="text-gray-600">
                    <strong>Status:</strong>{' '}
                    {user?.isEmailVerified ? (
                      <span className="text-green-600">Email Verified</span>
                    ) : (
                      <span className="text-yellow-600">Email Not Verified</span>
                    )}
                    {user?.role !== 'citizen' && (
                      <>
                        {' • '}
                        {user?.isVerified ? (
                          <span className="text-green-600">Account Verified</span>
                        ) : (
                          <span className="text-yellow-600">Pending Verification</span>
                        )}
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {user?.role === 'citizen' && (
                    <Link href="/report">
                      <Button variant="outline" className="w-full">
                        🚨 Report Dog Bite Incident
                      </Button>
                    </Link>
                  )}
                  <Link href="/incidents">
                    <Button variant="outline" className="w-full">
                      📋 {user?.role === 'citizen' ? 'View My Incidents' : 'View Incidents'}
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="outline" className="w-full">
                      👤 Edit Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

