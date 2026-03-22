'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { incidentApi } from '@/lib/incident-api';
import { showToast } from '@/components/ToastProvider';
import { CreateIncidentData, Hospital } from '@/types/incident';
import Link from 'next/link';

export default function ReportIncidentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [nearbyHospitals, setNearbyHospitals] = useState<Hospital[]>([]);
  const [showHospitals, setShowHospitals] = useState(false);

  const [formData, setFormData] = useState({
    incidentDate: new Date().toISOString().slice(0, 16),
    location: {
      coordinates: [0, 0] as [number, number],
      address: '',
      city: '',
      state: '',
      pincode: '',
    },
    description: '',
    severity: 'moderate' as 'minor' | 'moderate' | 'severe' | 'critical',
    victimAge: '',
    victimGender: '' as 'male' | 'female' | 'other' | '',
    dogDescription: '',
    dogColor: '',
    dogSize: '' as 'small' | 'medium' | 'large' | '',
    isStray: true,
    dogOwnerInfo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get user's current location
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: [position.coords.longitude, position.coords.latitude],
          },
        }));
        showToast('Location captured successfully', 'success');
        setIsGettingLocation(false);
      },
      (error) => {
        showToast(`Error getting location: ${error.message}`, 'error');
        setIsGettingLocation(false);
      }
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value,
        },
      }));
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.incidentDate) {
      newErrors.incidentDate = 'Incident date is required';
    }

    if (formData.location.coordinates[0] === 0 && formData.location.coordinates[1] === 0) {
      newErrors.location = 'Please capture your location';
    }

    if (!formData.location.address || formData.location.address.length < 10) {
      newErrors['location.address'] = 'Address must be at least 10 characters';
    }

    if (!formData.location.city) {
      newErrors['location.city'] = 'City is required';
    }

    if (!formData.location.state) {
      newErrors['location.state'] = 'State is required';
    }

    if (!formData.description || formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.severity) {
      newErrors.severity = 'Severity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const parsedAge = formData.victimAge ? parseInt(formData.victimAge) : undefined;
      
      // Validate parsed age
      if (parsedAge !== undefined && (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 150)) {
        showToast('Please enter a valid age between 0 and 150', 'error');
        return;
      }

      const incidentData: CreateIncidentData = {
        incidentDate: new Date(formData.incidentDate),
        location: formData.location,
        description: formData.description,
        severity: formData.severity,
        victimAge: parsedAge,
        victimGender: formData.victimGender || undefined,
        dogDescription: formData.dogDescription || undefined,
        dogColor: formData.dogColor || undefined,
        dogSize: formData.dogSize || undefined,
        isStray: formData.isStray,
        dogOwnerInfo: formData.dogOwnerInfo || undefined,
      };

      const response = await incidentApi.createIncident(incidentData);

      showToast('Incident reported successfully!', 'success');
      
      // Show nearby hospitals
      if (response.nearbyHospitals && response.nearbyHospitals.length > 0) {
        setNearbyHospitals(response.nearbyHospitals);
        setShowHospitals(true);
      } else {
        // Redirect to incidents list
        router.push('/incidents');
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: { message: string } } } };
      const errorMessage = apiError.response?.data?.error?.message || 'Failed to report incident';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (showHospitals) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow p-8">
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Incident Reported Successfully!</h2>
                <p className="text-gray-600">Here are the nearest hospitals with anti-rabies vaccines:</p>
              </div>

              <div className="space-y-4 mb-6">
                {nearbyHospitals.map((hospital, index) => (
                  <div key={hospital.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{index + 1}. {hospital.name}</h3>
                        <p className="text-sm text-gray-600">{hospital.address}</p>
                      </div>
                      <span className="text-sm font-medium text-blue-600">{hospital.distanceKm} km</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>📞 {hospital.phone}</span>
                      {hospital.hasVaccine && (
                        <span className="text-green-600 font-medium">✓ Vaccine Available</span>
                      )}
                    </div>
                    {hospital.emergencyContact && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Emergency Contact:</span> {hospital.emergencyContact.name} ({hospital.emergencyContact.phone})
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <Button onClick={() => router.push('/incidents')} className="flex-1">
                  View My Incidents
                </Button>
                <Button onClick={() => router.push('/home')} variant="outline" className="flex-1">
                  Go to Dashboard
                </Button>
              </div>
            </div>
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
                <span className="text-gray-600">Report Incident</span>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/home">
                  <Button variant="outline">Cancel</Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Report Dog Bite Incident</h2>
              <p className="text-gray-600">
                Please provide accurate information to help us respond quickly and effectively.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Incident Date & Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Incident Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="incidentDate"
                  value={formData.incidentDate}
                  onChange={handleChange}
                  max={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {errors.incidentDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.incidentDate}</p>
                )}
              </div>

              {/* Location Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h3>
                
                <div className="mb-4">
                  <Button
                    type="button"
                    onClick={getCurrentLocation}
                    isLoading={isGettingLocation}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    📍 {isGettingLocation ? 'Getting Location...' : 'Capture Current Location'}
                  </Button>
                  {formData.location.coordinates[0] !== 0 && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ Location captured: {formData.location.coordinates[1].toFixed(6)}, {formData.location.coordinates[0].toFixed(6)}
                    </p>
                  )}
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Address *"
                      name="location.address"
                      value={formData.location.address}
                      onChange={handleChange}
                      error={errors['location.address']}
                      placeholder="Street address, landmark"
                      required
                    />
                  </div>
                  <Input
                    label="City *"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleChange}
                    error={errors['location.city']}
                    placeholder="Mumbai"
                    required
                  />
                  <Input
                    label="State *"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleChange}
                    error={errors['location.state']}
                    placeholder="Maharashtra"
                    required
                  />
                  <Input
                    label="Pincode"
                    name="location.pincode"
                    value={formData.location.pincode}
                    onChange={handleChange}
                    placeholder="400001"
                  />
                </div>
              </div>

              {/* Incident Description */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Incident Details</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description * (minimum 20 characters)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe what happened, where the bite occurred on the body, and any other relevant details..."
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.description.length} / 2000 characters
                  </p>
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Severity *
                    </label>
                    <select
                      name="severity"
                      value={formData.severity}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="minor">Minor - Small scratch/bite</option>
                      <option value="moderate">Moderate - Visible wound</option>
                      <option value="severe">Severe - Deep wound/bleeding</option>
                      <option value="critical">Critical - Multiple bites/severe injury</option>
                    </select>
                  </div>

                  <Input
                    label="Victim Age"
                    name="victimAge"
                    type="number"
                    value={formData.victimAge}
                    onChange={handleChange}
                    placeholder="25"
                    min="0"
                    max="150"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Victim Gender
                    </label>
                    <select
                      name="victimGender"
                      value={formData.victimGender}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dog Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dog Details</h3>
                
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isStray"
                      checked={formData.isStray}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">This was a stray dog</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Dog Description"
                      name="dogDescription"
                      value={formData.dogDescription}
                      onChange={handleChange}
                      placeholder="Describe the dog's appearance, behavior, etc."
                    />
                  </div>

                  <Input
                    label="Dog Color"
                    name="dogColor"
                    value={formData.dogColor}
                    onChange={handleChange}
                    placeholder="Brown, Black, White, Mixed"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dog Size
                    </label>
                    <select
                      name="dogSize"
                      value={formData.dogSize}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select...</option>
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  {!formData.isStray && (
                    <div className="md:col-span-2">
                      <Input
                        label="Dog Owner Information"
                        name="dogOwnerInfo"
                        value={formData.dogOwnerInfo}
                        onChange={handleChange}
                        placeholder="Owner name, contact, address if known"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="border-t pt-6">
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="flex-1"
                  >
                    Submit Incident Report
                  </Button>
                  <Link href="/home" className="flex-1">
                    <Button type="button" variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
