// Nominatim Geocoding API (FREE - No API key needed!)

// Rate limiting helper (Nominatim allows 1 request/second)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let lastRequest = 0;

const rateLimitedFetch = async (url) => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequest;
  
  if (timeSinceLastRequest < 1000) {
    await sleep(1000 - timeSinceLastRequest);
  }
  
  lastRequest = Date.now();
  return fetch(url);
};

/**
 * Convert address to coordinates (Geocoding)
 * @param {string} address - Full address to search
 * @returns {Object|null} - { lat, lng, displayName } or null
 */
export const geocodeAddress = async (address) => {
  if (!address || address.trim().length < 3) {
    return null;
  }

  try {
    const response = await rateLimitedFetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(address)}&` +
      `format=json&` +
      `limit=1&` +
      `countrycodes=in&` + // Restrict to India
      `addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name,
        city: result.address?.city || result.address?.town || result.address?.village,
        state: result.address?.state,
        postcode: result.address?.postcode
      };
    }
    
    console.warn('No results found for address:', address);
    return null;
    
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

/**
 * Convert coordinates to address (Reverse Geocoding)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object|null} - Address details or null
 */
export const reverseGeocode = async (lat, lng) => {
  if (!lat || !lng) {
    return null;
  }

  try {
    const response = await rateLimitedFetch(
      `https://nominatim.openstreetmap.org/reverse?` +
      `lat=${lat}&` +
      `lon=${lng}&` +
      `format=json&` +
      `addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Reverse geocoding request failed');
    }
    
    const data = await response.json();
    
    if (data && data.address) {
      return {
        full: data.display_name,
        city: data.address.city || data.address.town || data.address.village || '',
        state: data.address.state || '',
        country: data.address.country || '',
        postcode: data.address.postcode || '',
        road: data.address.road || '',
        suburb: data.address.suburb || '',
        formatted: formatAddress(data.address)
      };
    }
    
    return null;
    
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

/**
 * Format address object into readable string
 */
const formatAddress = (address) => {
  const parts = [];
  
  if (address.road) parts.push(address.road);
  if (address.suburb) parts.push(address.suburb);
  if (address.city || address.town || address.village) {
    parts.push(address.city || address.town || address.village);
  }
  if (address.state) parts.push(address.state);
  if (address.postcode) parts.push(address.postcode);
  
  return parts.filter(Boolean).join(', ');
};

/**
 * Search for places (autocomplete-like functionality)
 * @param {string} query - Search query
 * @param {number} limit - Number of results (default: 5)
 * @returns {Array} - Array of places
 */
export const searchPlaces = async (query, limit = 5) => {
  if (!query || query.trim().length < 3) {
    return [];
  }

  try {
    const response = await rateLimitedFetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}&` +
      `format=json&` +
      `limit=${limit}&` +
      `countrycodes=in&` +
      `addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Place search failed');
    }
    
    const data = await response.json();
    
    return data.map(place => ({
      id: place.place_id,
      name: place.display_name,
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
      type: place.type,
      city: place.address?.city || place.address?.town || place.address?.village,
      state: place.address?.state
    }));
    
  } catch (error) {
    console.error('Place search error:', error);
    return [];
  }
};

/**
 * Get coordinates for Vadodara localities
 * @param {string} locality - Locality name (e.g., "Alkapuri", "Manjalpur")
 * @returns {Object|null} - Coordinates or null
 */
export const getVadodaraLocalityCoords = async (locality) => {
  const fullAddress = `${locality}, Vadodara, Gujarat, India`;
  return await geocodeAddress(fullAddress);
};