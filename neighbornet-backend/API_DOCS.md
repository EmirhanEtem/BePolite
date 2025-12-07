# NeighborNet Backend API Documentation

## Base URL
- Development: `http://localhost:3000`
- Production: `https://api.neighbornet.com` (example)

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user and device.

**Request:**
```json
{
  "phone": "1234567890",
  "password": "securepassword123",
  "email": "user@example.com",
  "deviceFingerprint": "device-unique-id-32-chars-min",
  "batteryLevel": 85,
  "connectionType": "4G"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "phone": "1234567890",
      "email": "user@example.com",
      "trustScore": 100
    },
    "device": {
      "id": "device-id",
      "deviceFingerprint": "device-unique-id"
    },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-jwt-token"
  },
  "message": "User registered successfully",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

#### POST /auth/login
Login existing user.

**Request:**
```json
{
  "phone": "1234567890",
  "password": "securepassword123",
  "deviceFingerprint": "device-unique-id"
}
```

**Response (200):**
Same as register response.

#### POST /auth/refresh
Refresh access token.

**Request:**
```json
{
  "refreshToken": "refresh-jwt-token"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-token",
    "refreshToken": "new-refresh-token"
  },
  "message": "Token refreshed",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

#### POST /auth/logout
Logout user (invalidates all refresh tokens).

**Request:**
```json
{
  "deviceId": "device-id"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true
  },
  "message": "Logged out successfully",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

### Users

#### GET /users/profile
Get current user profile. **[Protected]**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "phone": "1234567890",
    "email": "user@example.com",
    "trustScore": 100,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z",
    "devices": [
      {
        "id": "device-id",
        "deviceFingerprint": "fingerprint",
        "lastSeen": "2025-01-01T00:00:00Z",
        "batteryLevel": 85,
        "connectionType": "4G",
        "bandwidthEstimate": 25.5
      }
    ]
  },
  "timestamp": "2025-01-01T00:00:00Z"
}
```

#### PUT /users/profile
Update user profile. **[Protected]**

**Request:**
```json
{
  "email": "newemail@example.com"
}
```

**Response (200):**
Updated user object.

#### GET /users/devices
Get all devices for user. **[Protected]**

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "device-id",
      "deviceFingerprint": "fingerprint",
      "lastSeen": "2025-01-01T00:00:00Z",
      "batteryLevel": 85,
      "connectionType": "4G",
      "bandwidthEstimate": 25.5,
      "latitude": 40.7128,
      "longitude": -74.0060,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "timestamp": "2025-01-01T00:00:00Z"
}
```

#### PUT /users/devices/:deviceId
Update device info. **[Protected]**

**Request:**
```json
{
  "batteryLevel": 75,
  "connectionType": "5G",
  "bandwidthEstimate": 50,
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response (200):**
Updated device object.

#### GET /users/trust-score
Get user trust score. **[Protected]**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "trustScore": 100
  },
  "timestamp": "2025-01-01T00:00:00Z"
}
```

### Providers

#### GET /providers/nearby
Get nearby internet providers.

**Query Parameters:**
- `lat` (required): User latitude
- `lng` (required): User longitude
- `radius` (optional): Search radius in km (default: 5)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "deviceId": "device-id",
      "userId": "user-id",
      "distance": 0.5,
      "estimatedSpeed": 50,
      "batteryLevel": 85,
      "trustScore": 95,
      "score": 0.87
    }
  ],
  "timestamp": "2025-01-01T00:00:00Z"
}
```

#### GET /providers/best
Get best provider based on algorithm.

**Query Parameters:**
- `lat` (required): User latitude
- `lng` (required): User longitude
- `radius` (optional): Search radius in km (default: 5)

**Response (200):**
Returns best provider object (same structure as nearby).

#### POST /providers/setAvailability
Set device as internet provider. **[Protected]**

**Request:**
```json
{
  "isAvailable": true,
  "hotspotEnabled": true,
  "estimatedSpeed": 50,
  "maxShareMbps": 30
}
```

**Response (200):**
Updated provider availability object.

#### POST /providers/stopSharing
Stop sharing as provider. **[Protected]**

**Response (200):**
Updated provider availability with `isAvailable: false`.

#### GET /providers/status
Get current provider status. **[Protected]**

**Response (200):**
Provider availability object with user info.

#### GET /providers/history
Get provider session history. **[Protected]**

**Query Parameters:**
- `limit` (optional): Number of records (default: 50)

**Response (200):**
Array of provider sessions.

### Sessions

#### POST /sessions/start
Start a sharing session. **[Protected]**

**Request:**
```json
{
  "providerDeviceId": "device-id",
  "requesterDeviceId": "device-id"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "session-id",
    "providerDeviceId": "device-id",
    "requesterDeviceId": "device-id",
    "startTime": "2025-01-01T00:00:00Z",
    "endTime": null,
    "totalBytesShared": 0,
    "createdAt": "2025-01-01T00:00:00Z"
  },
  "timestamp": "2025-01-01T00:00:00Z"
}
```

#### POST /sessions/end
End a sharing session. **[Protected]**

**Request:**
```json
{
  "sessionId": "session-id",
  "totalBytesShared": 1024000000
}
```

**Response (200):**
Updated session object with end time.

#### GET /sessions/history
Get session history. **[Protected]**

**Query Parameters:**
- `limit` (optional): Number of records (default: 50)

**Response (200):**
Array of sessions.

#### GET /sessions/active
Get active sessions. **[Protected]**

**Response (200):**
Array of sessions with null endTime.

#### GET /sessions/stats
Get session statistics. **[Protected]**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalBytes": 5120000000
  },
  "timestamp": "2025-01-01T00:00:00Z"
}
```

### Speed Tests

#### POST /speedtest/report
Report speed test results. **[Protected]**

**Request:**
```json
{
  "uploadMbps": 25.5,
  "downloadMbps": 85.3,
  "latencyMs": 45
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "speedtest-id",
    "deviceId": "device-id",
    "uploadMbps": 25.5,
    "downloadMbps": 85.3,
    "latencyMs": 45,
    "timestamp": "2025-01-01T00:00:00Z"
  },
  "timestamp": "2025-01-01T00:00:00Z"
}
```

#### GET /speedtest/tests
Get device speed tests. **[Protected]**

**Query Parameters:**
- `limit` (optional): Number of records (default: 50)

**Response (200):**
Array of speed test records.

#### GET /speedtest/stats
Get device speed statistics. **[Protected]**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "count": 10,
    "avgUpload": 24.5,
    "avgDownload": 82.1,
    "avgLatency": 48,
    "maxDownload": 95.2,
    "minLatency": 35,
    "lastTest": "2025-01-01T00:00:00Z"
  },
  "timestamp": "2025-01-01T00:00:00Z"
}
```

#### GET /speedtest/global-stats
Get global speed statistics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "count": 1000,
    "avgUpload": 22.3,
    "avgDownload": 78.5,
    "avgLatency": 52,
    "maxDownload": 150,
    "minLatency": 10
  },
  "timestamp": "2025-01-01T00:00:00Z"
}
```

### Realtime

#### GET /realtime/ws
WebSocket connection for real-time updates.

**Query Parameters:**
- `token` (required): JWT token

**Message Types:**
- `subscribe`: Subscribe to updates
- `location-update`: Broadcast location change
- `availability-update`: Broadcast availability change
- `ping`: Keep-alive

**Example Message:**
```json
{
  "type": "availability-update",
  "data": {
    "isAvailable": true,
    "estimatedSpeed": 50
  }
}
```

#### GET /realtime/sse
Server-Sent Events for real-time updates. **[Protected]**

**Response:**
Streaming connection with server-sent events.

### Health

#### GET /health
Health check endpoint (no auth required).

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error code",
  "message": "Human-readable error message",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

### Common Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized
- `404`: Not Found
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

## Rate Limiting
- Limit: 100 requests per 15 minutes per IP
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Pagination
Endpoints that support pagination include:
- `limit`: Items per page
- `offset`: Start position (optional)

Response includes pagination info:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "pages": 2
  }
}
```
