const { Client } = require('@googlemaps/google-maps-services-js');

const client = new Client({});
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Geocode address to get lat/lng
const geocodeAddress = async (address) => {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      console.log('⚠️ Google Maps API key not configured, skipping geocoding');
      return { lat: null, lng: null };
    }

    const response = await client.geocode({
      params: {
        address: address,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }

    return { lat: null, lng: null };

  } catch (error) {
    console.error('Geocoding error:', error.message);
    return { lat: null, lng: null };
  }
};

module.exports = {
  geocodeAddress
};