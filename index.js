const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

function calculateRiskScore(guest) {
  let score = 0;
  if (guest.reviewCount < 2) score += 40;
  if (guest.hasNegativeReviews) score += 50;
  if (guest.tripCount < 2) score += 20;
  if (!guest.profilePicture) score += 10;
  return score;
}

app.post('/booking', (req, res) => {
  const guest = req.body.guest;
  const riskScore = calculateRiskScore(guest);
  console.log(`Guest: ${guest.name}, Risk Score: ${riskScore}`);
  res.status(200).json({ guest: guest.name, riskScore });
});

app.get('/', (req, res) => {
  res.send('Airbnb Risk Scorer API is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));