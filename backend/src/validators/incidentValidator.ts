/**
 * Validates incident report data
 */
export const validateIncidentReport = (data: {
  incidentDate?: Date | string;
  location?: {
    coordinates?: number[];
    address?: string;
    city?: string;
    state?: string;
  };
  description?: string;
  severity?: string;
  victimAge?: number;
  isStray?: boolean;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate incident date
  if (!data.incidentDate) {
    errors.push('Incident date is required');
  } else {
    const incidentDate = new Date(data.incidentDate);
    const now = new Date();
    if (isNaN(incidentDate.getTime())) {
      errors.push('Invalid incident date');
    } else if (incidentDate > now) {
      errors.push('Incident date cannot be in the future');
    }
  }

  // Validate location
  if (!data.location) {
    errors.push('Location is required');
  } else {
    if (!data.location.coordinates || data.location.coordinates.length !== 2) {
      errors.push('Valid GPS coordinates are required');
    } else {
      const [lng, lat] = data.location.coordinates;
      if (lng < -180 || lng > 180) {
        errors.push('Longitude must be between -180 and 180');
      }
      if (lat < -90 || lat > 90) {
        errors.push('Latitude must be between -90 and 90');
      }
    }

    if (!data.location.address || data.location.address.trim().length < 10) {
      errors.push('Address must be at least 10 characters long');
    }

    if (!data.location.city || data.location.city.trim().length < 2) {
      errors.push('City is required');
    }

    if (!data.location.state || data.location.state.trim().length < 2) {
      errors.push('State is required');
    }
  }

  // Validate description
  if (!data.description || data.description.trim().length < 20) {
    errors.push('Description must be at least 20 characters long');
  } else if (data.description.trim().length > 2000) {
    errors.push('Description must not exceed 2000 characters');
  }

  // Validate severity
  const validSeverities = ['minor', 'moderate', 'severe', 'critical'];
  if (!data.severity || !validSeverities.includes(data.severity)) {
    errors.push('Severity must be one of: minor, moderate, severe, critical');
  }

  // Validate victim age if provided
  if (data.victimAge !== undefined && data.victimAge !== null) {
    if (data.victimAge < 0 || data.victimAge > 150) {
      errors.push('Victim age must be between 0 and 150');
    }
  }

  // Validate isStray
  if (data.isStray === undefined || data.isStray === null) {
    errors.push('Please specify if the dog is a stray');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates incident status update
 */
export const validateStatusUpdate = (data: {
  status?: string;
  notes?: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  const validStatuses = ['reported', 'assigned', 'in_treatment', 'treated', 'closed'];
  if (!data.status || !validStatuses.includes(data.status)) {
    errors.push('Status must be one of: reported, assigned, in_treatment, treated, closed');
  }

  if (data.notes && data.notes.trim().length > 1000) {
    errors.push('Notes must not exceed 1000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates hospital assignment
 */
export const validateHospitalAssignment = (data: {
  hospitalId?: string;
  notes?: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.hospitalId || data.hospitalId.trim().length === 0) {
    errors.push('Hospital ID is required');
  }

  if (data.notes && data.notes.trim().length > 1000) {
    errors.push('Notes must not exceed 1000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates vaccination record
 */
export const validateVaccinationRecord = (data: {
  dose?: number;
  date?: Date | string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.dose || data.dose < 1 || data.dose > 10) {
    errors.push('Dose number must be between 1 and 10');
  }

  if (!data.date) {
    errors.push('Vaccination date is required');
  } else {
    const vaccineDate = new Date(data.date);
    if (isNaN(vaccineDate.getTime())) {
      errors.push('Invalid vaccination date');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
