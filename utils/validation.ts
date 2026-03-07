// Validation utility module for form field validation

export const ValidationRules = {
  firstName: {
    required: true,
    pattern: /^[A-Za-z]+$/,
    message: 'First name must contain only letters'
  },
  
  lastName: {
    required: true,
    pattern: /^[A-Za-z]+$/,
    message: 'Last name must contain only letters'
  },
  
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  
  phoneNumber: {
    required: true,
    pattern: /^(\+234|0)[789]\d{9}$/,
    message: 'Please enter a valid Nigerian phone number'
  },
  
  password: {
    required: true,
    minLength: 8,
    message: 'Password must be at least 8 characters long'
  },
  
  bvn: {
    required: true,
    pattern: /^\d{11}$/,
    message: 'BVN must be exactly 11 digits'
  },
  
  nin: {
    required: true,
    pattern: /^\d{11}$/,
    message: 'NIN must be exactly 11 digits'
  },
  
  dateOfBirth: {
    required: true,
    validate: (value: string) => {
      const date = new Date(value);
      const age = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return age >= 18;
    },
    message: 'You must be at least 18 years old'
  },
  
  address: {
    required: true,
    minLength: 10,
    message: 'Address must be at least 10 characters long'
  },
  
  groupName: {
    required: true,
    minLength: 3,
    message: 'Group name must be at least 3 characters long'
  },
  
  maxMembers: {
    required: true,
    min: 2,
    max: 50,
    message: 'Max members must be between 2 and 50'
  },
  
  duration: {
    required: true,
    min: 1,
    max: 24,
    message: 'Duration must be between 1 and 24 months'
  },
  
  contributionAmount: {
    required: true,
    min: 1,
    message: 'Contribution amount must be greater than 0'
  },
  
  invitationCode: {
    required: true,
    pattern: /^[A-Z0-9]{6}$/,
    message: 'Invitation code must be exactly 6 characters'
  }
};

export function validateField(fieldName: string, value: any): string | null {
  const rule = ValidationRules[fieldName as keyof typeof ValidationRules];
  if (!rule) return null;
  
  // Check required
  if (rule.required && (!value || value.toString().trim() === '')) {
    return `${fieldName} is required`;
  }
  
  // Check pattern
  if ('pattern' in rule && rule.pattern && !rule.pattern.test(value)) {
    return rule.message;
  }
  
  // Check minLength
  if ('minLength' in rule && rule.minLength && value.length < rule.minLength) {
    return rule.message;
  }
  
  // Check min/max
  if ('min' in rule && rule.min !== undefined && Number(value) < rule.min) {
    return rule.message;
  }
  
  if ('max' in rule && rule.max !== undefined && Number(value) > rule.max) {
    return rule.message;
  }
  
  // Check custom validation
  if ('validate' in rule && rule.validate && !rule.validate(value)) {
    return rule.message;
  }
  
  return null;
}

export function validateForm(formData: Record<string, any>, fields: string[]): Record<string, string> {
  const errors: Record<string, string> = {};
  
  fields.forEach(field => {
    const error = validateField(field, formData[field]);
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
}
