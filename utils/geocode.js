const axios = require("axios");

async function getCoordinates(location) {
    const response = await axios.get(
        "https://nominatim.openstreetmap.org/search", {
            params: {
                q: location,
                format: "json",
                limit: 1,
            },
            headers: {
                "User-Agent": "HavenStay"
            }
        }
    );

    if (response.data.length > 0) {
        return {
            lat: parseFloat(response.data[0].lat),
            lng: parseFloat(response.data[0].lon),
        };
    }

    return null;
}

module.exports = getCoordinates;