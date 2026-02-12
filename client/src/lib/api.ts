const API_BASE_URL = '/api/v1'

export interface ApiError {
  message: string
  status: number
  code?: string
}

function getToken(): string | null {
  return localStorage.getItem('authToken')
}

function getHeaders(): HeadersInit {
  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: { code: string; message: string }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type')
  const json = contentType?.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const error: ApiError = {
      message: typeof json === 'object' ? json?.error?.message || json?.message || 'Unknown error' : String(json),
      status: response.status,
      code: typeof json === 'object' ? json?.error?.code || json?.code : undefined,
    }
    throw error
  }

  // Extract data from API envelope { success: true, data: T }
  if (typeof json === 'object' && json !== null && 'success' in json && 'data' in json) {
    return json.data as T
  }

  return json as T
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: getHeaders(),
  })
  return handleResponse<T>(response)
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  })
  return handleResponse<T>(response)
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body),
  })
  return handleResponse<T>(response)
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
  return handleResponse<T>(response)
}
