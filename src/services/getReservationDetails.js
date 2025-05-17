const axios = require('axios');

async function getReservationDetails(uuid) {
  const url = `https://public.api.hospitable.com/v2/reservations/${uuid}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.HOSPITABLE_API_KEY}`
      }
    });
    console.log(`Reservation by ID ${response.data}`)
    return response.data;
  } catch (error) {
    console.error(`Hospitable API error: ${error.message} on ${url}`);
    return null;
  }
}

module.exports = { getReservationDetails };
