export enum API_SERVICES {
  TEST_SERVICE = 'test',
  AUTH_SERVICE = 'auth',
  COURSE_SERVICE = 'courses'
}

export const getApiEndpoint = (service: API_SERVICES): string => {
  const isServer = typeof window === 'undefined'
  let endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT
  if (isServer) {
    endpoint = process.env.NEXT_PUBLIC_API_INTERNAL_ENDPOINT
  }
  return `${endpoint}/${service}`
}
