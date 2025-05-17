require('dotenv').config();
const express = require('express');
const { calculateRiskScore } = require('./riskScorer');
const { getReservationDetails } = require('./getReservationDetails');
const { saveTestPayload } = require('./utils/saveTestPayload');

const app = express();
app.use(express.json());

app.post('/booking', async (req, res) => {
  try {
    const reservationId = req.body?.id;
    console.log(`ReservationId = ${reservationId}`);
    if (reservationId) {
      saveTestPayload(req.body, reservationId);
      const reservation = await getReservationDetails(reservationId);
      const riskScore = calculateRiskScore(reservation);
    }
    console.log(`Returning 200 to Webhook.`);
    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(500).send('Server error');
  }
});

app.get('/', (req, res) => {
  res.send('Airbnb Risk Scorer API is running');
});

app.use((req, res, next) => {
  console.log(`⚠️ No matching route: ${req.method} ${req.originalUrl}`);
  res.status(404).send('Not Found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
