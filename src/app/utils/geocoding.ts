// Geocoding utilities for address lookups

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    // Using Nominatim (OpenStreetMap) for reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    
    const data = await response.json();
    
    // Format the address nicely
    const address = data.address;
    const parts = [];
    
    if (address.road) parts.push(address.road);
    if (address.suburb) parts.push(address.suburb);
    if (address.city || address.town) parts.push(address.city || address.town);
    if (address.state) parts.push(address.state);
    if (address.postcode) parts.push(address.postcode);
    
    return parts.length > 0 ? parts.join(', ') : data.display_name;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

export const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location permission denied. Please enable location access in your browser settings.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location information is unavailable.'));
            break;
          case error.TIMEOUT:
            reject(new Error('Location request timed out.'));
            break;
          default:
            reject(new Error('An unknown error occurred.'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

export const getUserCityName = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
    );
    if (!response.ok) return 'your area';
    const data = await response.json();
    const address = data.address;
    return address.city || address.town || address.suburb || address.county || address.state || 'your area';
  } catch (error) {
    return 'your area';
  }
};
