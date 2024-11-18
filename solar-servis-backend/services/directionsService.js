const axios = require("axios");

/**
 * Výpočet vzdálenosti a času mezi dvěma body pomocí Mapbox Directions API.
 * @param {number[]} start - Pole se souřadnicemi [longitude, latitude] počátečního bodu.
 * @param {number[]} end - Pole se souřadnicemi [longitude, latitude] cílového bodu.
 * @returns {Promise<{distance: number, duration: number}>} - Vzdálenost v kilometrech a čas v minutách.
 */
async function calculateTravelTime(start, end) {
    const MAPBOX_TOKEN = "sk.eyJ1IjoieW9vZmVjIiwiYSI6ImNtM25pbmVibTE0dm0yaXF6Yzc0bTVuYzEifQ.cEcmM8ag0uxK9meBserqSg";

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?access_token=${MAPBOX_TOKEN}`;

    try {
        const response = await axios.get(url);

        if (response.data.code !== "Ok") {
            throw new Error(response.data.message || "Chyba při volání Directions API.");
        }

        const route = response.data.routes[0];

        return {
            distance: route.distance / 1000, // Vzdálenost v kilometrech
            duration: route.duration / 60, // Doba cesty v minutách
        };
    } catch (error) {
        console.error("Chyba při získávání trasy z Mapbox API:", error.message);
        throw new Error("Nelze vypočítat vzdálenost a čas.");
    }
}

module.exports = { calculateTravelTime };
