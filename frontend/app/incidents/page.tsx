'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import { incidentApi } from '@/lib/incident-api';
import { Incident } from '@/types/incident';
import Link from 'next/link';

export default function IncidentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    city: '',
  });

  useEffect(() => {
    fetchIncidents();
  }, [filters, pagination.page]);

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const response = await incidentApi.getIncidents({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });

      setIncidents(response.incidents);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      reported: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      in_treatment: 'bg-purple-100 text-purple-800',
      treated: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityBadgeColor = (severity: string) => {
    const colors = {
      minor: 'bg-green-100 text-green-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      severe: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center gap-4">
                <Link href="/home" className="text-xl font-semibold">
                  Sahara
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">Incidents</span>
              </div>
              <div className="flex items-center gap-4">
                {user?.role === 'citizen' && (
                  <Link href="/report">
                    <Button>Report New Incident</Button>
                  </Link>
                )}
                <Link href="/home">
                  <Button variant="outline">Dashboard</Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="reported">Reported</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_treatment">In Treatment</option>
                  <option value="treated">Treated</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity
                </label>
                <select
                  name="severity"
                  value={filters.severity}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Severities</option>
                  <option value="minor">Minor</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Filter by city"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Incidents List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.role === 'citizen' ? 'My Incidents' : 'Incidents'}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({pagination.total} total)
                </span>
              </h2>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading incidents...</p>
              </div>
            ) : incidents.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No incidents found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {user?.role === 'citizen' 
                    ? 'You haven\'t reported any incidents yet.'
                    : 'No incidents match your filters.'}
                </p>
                {user?.role === 'citizen' && (
                  <div className="mt-6">
                    <Link href="/report">
                      <Button>Report Your First Incident</Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {incidents.map((incident) => (
                  <div
                    key={incident.id}
                    onClick={() => router.push(`/incidents/${incident.id}`)}
                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadgeColor(incident.status)}`}>
                            {incident.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityBadgeColor(incident.severity)}`}>
                            {incident.severity.toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          Incident in {incident.location.city}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {incident.description}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm text-gray-500">
                          {formatDate(incident.reportedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>📍 {incident.location.address}</span>
                      {incident.assignedHospitalName && (
                        <span>🏥 {incident.assignedHospitalName}</span>
                      )}
                      {incident.vaccineAdministered && (
                        <span className="text-green-600 font-medium">💉 Vaccinated</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {pagination.page} of {pagination.pages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
