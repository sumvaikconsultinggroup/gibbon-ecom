// IP Geolocation utility using free ip-api.com
// Rate limit: 45 requests per minute for free tier

interface GeoData {
  city: string
  region: string
  country: string
  lat: number
  lng: number
  timezone: string
}

// Cache geo data to avoid repeated lookups
const geoCache = new Map<string, GeoData>()

// India cities fallback data when IP lookup fails
const INDIA_CITIES: Record<string, GeoData> = {
  'Mumbai': { city: 'Mumbai', region: 'Maharashtra', country: 'India', lat: 19.076, lng: 72.877, timezone: 'Asia/Kolkata' },
  'Delhi': { city: 'Delhi', region: 'Delhi', country: 'India', lat: 28.613, lng: 77.209, timezone: 'Asia/Kolkata' },
  'Bangalore': { city: 'Bangalore', region: 'Karnataka', country: 'India', lat: 12.971, lng: 77.594, timezone: 'Asia/Kolkata' },
  'Chennai': { city: 'Chennai', region: 'Tamil Nadu', country: 'India', lat: 13.082, lng: 80.270, timezone: 'Asia/Kolkata' },
  'Hyderabad': { city: 'Hyderabad', region: 'Telangana', country: 'India', lat: 17.385, lng: 78.486, timezone: 'Asia/Kolkata' },
  'Pune': { city: 'Pune', region: 'Maharashtra', country: 'India', lat: 18.520, lng: 73.856, timezone: 'Asia/Kolkata' },
  'Kolkata': { city: 'Kolkata', region: 'West Bengal', country: 'India', lat: 22.572, lng: 88.363, timezone: 'Asia/Kolkata' },
  'Ahmedabad': { city: 'Ahmedabad', region: 'Gujarat', country: 'India', lat: 23.022, lng: 72.571, timezone: 'Asia/Kolkata' },
  'Jaipur': { city: 'Jaipur', region: 'Rajasthan', country: 'India', lat: 26.912, lng: 75.787, timezone: 'Asia/Kolkata' },
  'Lucknow': { city: 'Lucknow', region: 'Uttar Pradesh', country: 'India', lat: 26.846, lng: 80.946, timezone: 'Asia/Kolkata' },
}

// Random India city for development/localhost
function getRandomIndiaCity(): GeoData {
  const cities = Object.values(INDIA_CITIES)
  return cities[Math.floor(Math.random() * cities.length)]
}

export async function getGeoFromIP(ip: string): Promise<GeoData> {
  // Check cache first
  if (geoCache.has(ip)) {
    return geoCache.get(ip)!
  }

  // For localhost/development, return random India city
  if (ip === 'unknown' || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    const randomCity = getRandomIndiaCity()
    geoCache.set(ip, randomCity)
    return randomCity
  }

  try {
    // Use ip-api.com (free, no API key needed, 45 req/min limit)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,regionName,country,lat,lon,timezone`, {
      signal: AbortSignal.timeout(3000), // 3 second timeout
    })
    
    if (!response.ok) {
      throw new Error('IP lookup failed')
    }

    const data = await response.json()
    
    if (data.status !== 'success') {
      throw new Error('IP lookup returned failure status')
    }

    const geoData: GeoData = {
      city: data.city || 'Unknown',
      region: data.regionName || '',
      country: data.country || 'Unknown',
      lat: data.lat || 0,
      lng: data.lon || 0,
      timezone: data.timezone || 'UTC',
    }

    // Cache the result
    geoCache.set(ip, geoData)
    return geoData

  } catch (error) {
    console.error('Geo lookup error:', error)
    // Fallback to random India city for Indian IPs
    const fallback = getRandomIndiaCity()
    geoCache.set(ip, fallback)
    return fallback
  }
}

export function clearGeoCache() {
  geoCache.clear()
}
