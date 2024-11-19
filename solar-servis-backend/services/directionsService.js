import superagent from 'superagent';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Funkce pro výpočet času a vzdálenosti mezi dvěma body.
 * @param {Object} from - Souřadnice startovního bodu (lat, lng).
 * @param {Object} to - Souřadnice cílového bodu (lat, lng).
 */
export const calculateTravelTime = async (from, to) => {
  try {
    // Vytvoření GET požadavku na Google Distance Matrix API pomocí superagent
    const response = await superagent
      .get('https://maps.googleapis.com/maps/api/distancematrix/json')
      .query({
        origins: `${from.lat},${from.lng}`,
        destinations: `${to.lat},${to.lng}`,
        key: GOOGLE_MAPS_API_KEY,
      });

    // Extrakce dat z odpovědi
    const result = response.body.rows[0].elements[0];
    return {
      distance: result.distance.value / 1000, // Převod na kilometry
      duration: result.duration.value / 60,   // Převod na minuty
    };
  } catch (error) {
    console.error("Chyba při výpočtu vzdálenosti a času:", error);
    return { distance: 0, duration: 0 };
  }
};
