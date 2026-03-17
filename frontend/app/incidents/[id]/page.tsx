'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import { incidentApi } from '@/lib/incident-api';
import { Incident } from '@/types/incident';
import { showToast } from '@/components/ToastProvider';
import Link from 'next/link';

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchIncident();
    }
  }, [params.id]);

  const fetchIncident = async () => {
    setIsLoading(true);
    try {
      const response = await incidentApi.getIncidentById(params.id as string);
      setIncident(response.incident);
    } catch (error: unknown) {
      const apiError = error as { response?: { status?: number } };
      if (apiError.response?.status === 403) {
        showToast('Access denied', 'error');
        router.push('/incidents');
      } else {
        showToast('Failed to load incident', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      showToast('Please select a status', 'error');
      return;
    }

    setIsUpdating(true);
    try {
      await incidentApi.updateStatus(params.id as string, newStatus, statusNotes);
      showToast('Status updated successfully', 'success');
      setShowStatusUpdate(false);
      setNewStatus('');
      setStatusNotes('');
      fetchIncident(); // Refresh data
    } catch (error) {
      showToast('Failed to update status', 'error');
    } finally {
      setIsUpdating(false);
    }
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canUpdateStatus = user?.role === 'hospital' || user?.role === 'authority' || user?.role === 'animal_control';

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading incident details...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!incident) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Incident Not Found</h2>
            <p className="text-gray-600 mb-4">The incident you're looking for doesn't exist or you don't have access to it.</p>
            <Link href="/incidents">
              <Button>Back to Incidents</Button>
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

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
                <Link href="/incidents" className="text-gray-600 hover:text-gray-900">
                  Incidents
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">Details</span>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/incidents">
                  <Button variant="outline">Back to List</Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 text-sm font-medium rounded ${getStatusBadgeColor(incident.status)}`}>
                        {incident.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 text-sm font-medium rounded ${getSeverityBadgeColor(incident.severity)}`}>
                        {incident.severity.toUpperCase()}
                      </span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Incident in {incident.location.city}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Reported on {formatDate(incident.reportedAt)}
                    </p>
                  </div>
                  {canUpdateStatus && (
                    <Button onClick={() => setShowStatusUpdate(!showStatusUpdate)}>
                      Update Status
                    </Button>
                  )}
                </div>

                {/* Status Update Form */}
                {showStatusUpdate && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Status
                        </label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select status...</option>
                          <option value="reported">Reported</option>
                          <option value="assigned">Assigned</option>
                          <option value="in_treatment">In Treatment</option>
                          <option value="treated">Treated</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notes (optional)
                        </label>
                        <textarea
                          value={statusNotes}
                          onChange={(e) => setStatusNotes(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add any notes about this status change..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleStatusUpdate} isLoading={isUpdating}>
                          Update
                        </Button>
                        <Button variant="outline" onClick={() => setShowStatusUpdate(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Incident Details */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Incident Details</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                    <p className="text-gray-900">{incident.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Incident Date</h3>
                      <p className="text-gray-900">{formatDate(incident.incidentDate)}</p>
                    </div>
                    {incident.victimAge && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Victim Age</h3>
                        <p className="text-gray-900">{incident.victimAge} years</p>
                      </div>
                    )}
                    {incident.victimGender && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Victim Gender</h3>
                        <p className="text-gray-900 capitalize">{incident.victimGender}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
                <div className="space-y-2">
                  <p className="text-gray-900">{incident.location.address}</p>
                  <p className="text-gray-600">
                    {incident.location.city}, {incident.location.state}
                    {incident.location.pincode && ` - ${incident.location.pincode}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    GPS: {incident.location.coordinates[1].toFixed(6)}, {incident.location.coordinates[0].toFixed(6)}
                  </p>
                </div>
              </div>

              {/* Dog Details */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Dog Details</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${incident.isStray ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                      {incident.isStray ? 'STRAY DOG' : 'OWNED DOG'}
                    </span>
                    {incident.dogSize && (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 capitalize">
                        {incident.dogSize}
                      </span>
                    )}
                  </div>
                  {incident.dogDescription && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                      <p className="text-gray-900">{incident.dogDescription}</p>
                    </div>
                  )}
                  {incident.dogColor && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Color</h3>
                      <p className="text-gray-900">{incident.dogColor}</p>
                    </div>
                  )}
                  {incident.dogOwnerInfo && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Owner Information</h3>
                      <p className="text-gray-900">{incident.dogOwnerInfo}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {incident.notes && incident.notes.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Log</h2>
                  <div className="space-y-3">
                    {incident.notes.map((note, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                        <p className="text-gray-900">{note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Reporter Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Reporter</h2>
                <div className="space-y-2">
                  <p className="text-gray-900 font-medium">{incident.reporterName}</p>
                  <p className="text-sm text-gray-600">📞 {incident.reporterPhone}</p>
                  <p className="text-sm text-gray-600">✉️ {incident.reporterEmail}</p>
                </div>
              </div>

              {/* Hospital Assignment */}
              {incident.assignedHospitalName && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Assigned Hospital</h2>
                  <div className="space-y-2">
                    <p className="text-gray-900 font-medium">{incident.assignedHospitalName}</p>
                    {incident.assignedStaffName && (
                      <p className="text-sm text-gray-600">Staff: {incident.assignedStaffName}</p>
                    )}
                    {incident.assignedAt && (
                      <p className="text-sm text-gray-500">Assigned: {formatDate(incident.assignedAt)}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Treatment Status */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Treatment Status</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">First Aid Given</span>
                    <span className={`text-sm font-medium ${incident.firstAidGiven ? 'text-green-600' : 'text-gray-400'}`}>
                      {incident.firstAidGiven ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Hospital Visited</span>
                    <span className={`text-sm font-medium ${incident.hospitalVisited ? 'text-green-600' : 'text-gray-400'}`}>
                      {incident.hospitalVisited ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Vaccine Administered</span>
                    <span className={`text-sm font-medium ${incident.vaccineAdministered ? 'text-green-600' : 'text-gray-400'}`}>
                      {incident.vaccineAdministered ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vaccination Schedule */}
              {incident.vaccinationSchedule && incident.vaccinationSchedule.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Vaccination Schedule</h2>
                  <div className="space-y-2">
                    {incident.vaccinationSchedule.map((vaccine, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <span className="text-sm text-gray-600">Dose {vaccine.dose}</span>
                        <div className="text-right">
                          <p className="text-sm text-gray-900">{formatDate(vaccine.date)}</p>
                          <span className={`text-xs ${vaccine.completed ? 'text-green-600' : 'text-yellow-600'}`}>
                            {vaccine.completed ? '✓ Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Reported</p>
                    <p className="text-xs text-gray-500">{formatDate(incident.reportedAt)}</p>
                  </div>
                  {incident.assignedAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-900">Assigned</p>
                      <p className="text-xs text-gray-500">{formatDate(incident.assignedAt)}</p>
                    </div>
                  )}
                  {incident.treatedAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-900">Treated</p>
                      <p className="text-xs text-gray-500">{formatDate(incident.treatedAt)}</p>
                    </div>
                  )}
                  {incident.closedAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-900">Closed</p>
                      <p className="text-xs text-gray-500">{formatDate(incident.closedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
