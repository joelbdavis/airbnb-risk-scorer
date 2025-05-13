# Airbnb Risk Scorer

A simple Node/Express app that receives booking requests and calculates a custom risk score based on guest criteria (e.g., number of reviews, trips, profile completeness).

## Features

- Webhook endpoint to receive booking requests (e.g., from Hospitable)
- Customizable risk scoring logic
- JSON API response

## Getting Started

```bash
npm install
cp .env.sample .env
node index.js
```
