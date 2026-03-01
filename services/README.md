# Services

This directory contains service layer implementations for the AjoSave mobile application.

## ApiService

HTTP client for backend communication with the following features:

### Features

- **Base HTTP Methods**: GET, POST, PUT, DELETE
- **Automatic Token Injection**: Automatically adds Bearer token to Authorization header
- **Request/Response Interceptors**: Customize requests and responses
- **Timeout Handling**: 30-second default timeout for all requests
- **Automatic Retry**: Retries network failures up to 3 times with exponential backoff
- **Development Logging**: Logs requests and responses in `__DEV__` mode
- **Error Normalization**: Consistent error handling using `handleApiError`
- **Response Normalization**: Ensures consistent `ApiResponse<T>` format

### Usage

#### Basic Setup

```typescript
import { ApiService } from './services';

// Set base URL (typically in app initialization)
ApiService.setBaseUrl('https://api.ajosave.com');

// Initialize (loads stored token)
await ApiService.initialize();
```

#### Making Requests

```typescript
// GET request
const users = await ApiService.get<User[]>('/users');

// GET with query parameters
const filteredUsers = await ApiService.get<User[]>('/users', {
  page: 1,
  limit: 10,
  status: 'active'
});

// POST request
const newUser = await ApiService.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// PUT request
const updatedUser = await ApiService.put<User>('/users/123', {
  name: 'Jane Doe'
});

// DELETE request
await ApiService.delete('/users/123');
```

#### Authentication

```typescript
// Set token after login
const loginResponse = await ApiService.post<AuthResponse>('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

ApiService.setAuthToken(loginResponse.data.token);

// Clear token on logout
ApiService.clearAuthToken();
```

#### Interceptors

```typescript
// Request interceptor - add custom headers
ApiService.onRequest((config) => {
  config.headers['X-App-Version'] = '1.0.0';
  return config;
});

// Response interceptor - transform data
ApiService.onResponse((response) => {
  // Add timestamp to all responses
  response.timestamp = new Date().toISOString();
  return response;
});

// Error interceptor - handle errors globally
ApiService.onError((error) => {
  if (error.status === 401) {
    // Navigate to login screen
    router.replace('/login');
  }
});
```

#### Error Handling

```typescript
try {
  const data = await ApiService.get('/protected-resource');
} catch (error) {
  if (error.code === 'UNAUTHORIZED') {
    // Handle unauthorized access
  } else if (error.code === 'NETWORK_ERROR') {
    // Handle network failure
  } else {
    // Handle other errors
    console.error(error.message);
  }
}
```

### Response Format

All responses are normalized to the following format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
```

### Retry Logic

Network failures are automatically retried up to 3 times with exponential backoff:
- 1st retry: 1 second delay
- 2nd retry: 2 seconds delay
- 3rd retry: 4 seconds delay

Only network errors trigger retries. API errors (4xx, 5xx) do not retry.

### Timeout

All requests have a 30-second timeout by default. Timeout errors are handled as:

```typescript
{
  code: 'GATEWAY_TIMEOUT',
  status: 504,
  message: 'Request timed out. Please try again.'
}
```

## StorageService

Type-safe wrapper around AsyncStorage for local data persistence.

### Features

- JSON serialization/deserialization
- Type-safe get/set operations
- Batch operations (multiGet, multiSet, multiRemove)
- Error handling

### Usage

```typescript
import { StorageService, STORAGE_KEYS } from './services';

// Store data
await StorageService.set(STORAGE_KEYS.AUTH_TOKEN, 'token-value');

// Retrieve data
const token = await StorageService.get<string>(STORAGE_KEYS.AUTH_TOKEN);

// Remove data
await StorageService.remove(STORAGE_KEYS.AUTH_TOKEN);

// Clear all storage
await StorageService.clear();
```

### Storage Keys

Predefined keys for consistent storage access:

```typescript
const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@user_data',
  BIOMETRIC_ENABLED: '@biometric_enabled',
  WALLET_DATA: '@wallet_data',
  TRANSACTIONS_DATA: '@transactions_data',
  GROUPS_DATA: '@groups_data',
  THEME_PREFERENCE: '@theme_preference',
  OFFLINE_QUEUE: '@offline_queue',
};
```

## BiometricService

Face ID/Touch ID authentication wrapper using Expo LocalAuthentication.

### Features

- Check biometric hardware availability
- Get supported biometric types (fingerprint, facial, iris)
- Authenticate with biometric prompt
- Check enrollment status
- Manage biometric preference (enable/disable)

### Usage

#### Check Availability

```typescript
import { BiometricService } from './services';

// Check if biometric hardware is available
const isAvailable = await BiometricService.isAvailable();

// Get supported biometric types
const types = await BiometricService.getSupportedTypes();
// Returns: ['fingerprint'] | ['facial'] | ['iris'] | ['fingerprint', 'facial']
```

#### Authenticate

```typescript
// Authenticate with default options
const result = await BiometricService.authenticate();

if (result.success) {
  // Authentication successful
  console.log('Biometric authentication successful');
} else {
  // Authentication failed
  console.error('Error:', result.error);
  if (result.warning) {
    console.warn('Warning:', result.warning);
  }
}

// Authenticate with custom options
const result = await BiometricService.authenticate({
  promptMessage: 'Scan your face to continue',
  cancelLabel: 'Not now',
  disableDeviceFallback: true,
  fallbackLabel: 'Use password',
});
```

#### Check Enrollment

```typescript
// Check if user has enrolled biometric credentials
const isEnrolled = await BiometricService.isEnrolled();

if (!isEnrolled) {
  // Prompt user to enroll biometrics in device settings
}
```

#### Manage Preferences

```typescript
// Check if biometric is enabled in app
const isEnabled = await BiometricService.isEnabled();

// Enable biometric authentication
await BiometricService.enable();

// Disable biometric authentication
await BiometricService.disable();
```

### Types

```typescript
// Biometric authentication types
type BiometricType = 'fingerprint' | 'facial' | 'iris';

// Authentication options
interface BiometricOptions {
  promptMessage?: string;
  cancelLabel?: string;
  disableDeviceFallback?: boolean;
  fallbackLabel?: string;
}

// Authentication result
interface BiometricResult {
  success: boolean;
  error?: string;
  warning?: string;
}
```

### Error Handling

The service handles errors gracefully and returns appropriate error messages:

```typescript
const result = await BiometricService.authenticate();

if (!result.success) {
  switch (result.error) {
    case 'Biometric authentication is not available on this device':
      // Device doesn't have biometric hardware
      break;
    case 'No biometric credentials are enrolled on this device':
      // User hasn't set up biometrics
      break;
    case 'User cancelled':
      // User cancelled the authentication
      break;
    default:
      // Other errors
      console.error(result.error);
  }
}
```
