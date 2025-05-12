import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

// Check token expiration at startup
try {
  // Extract the payload from the JWT (second part, base64url encoded)
  const payload = JSON.parse(Buffer.from(ACCESS_TOKEN.split('.')[1], 'base64').toString());
  if (payload && payload.MapClaims && payload.MapClaims.exp) {
    const expiresIn = payload.MapClaims.exp;
    const expirationTime = new Date(expiresIn * 1000);
    const currentTime = new Date();
    console.log("Token expiration time:", expirationTime);
    console.log("Current time:", currentTime);
    if (currentTime > expirationTime) {
      console.log("Token has expired");
    } else {
      console.log("Token is valid");
    }
  }
} catch (e) {
  console.log("Could not parse token expiration:", e.message);
}

const app = express();
app.use(cors());

const WINDOW_SIZE = 10;
const API_MAP = {
  p: "primes",
  prime: "primes",
  f: "fibo",
  fibo: "fibo",
  e: "even",
  even: "even",
  r: "rand",
  rand: "rand",
};

const windows = {
  p: [],
  prime: [],
  f: [],
  fibo: [],
  e: [],
  even: [],
  r: [],
  rand: [],
};

function uniqueWindow(arr) {
  const seen = new Set();
  return arr.filter((n) => {
    if (seen.has(n)) return false;
    seen.add(n);
    return true;
  });
}

app.get('/numbers/:type', async (req, res) => {
  const type = req.params.type;
  if (!API_MAP[type]) {
    return res.status(400).json({ error: "Invalid type" });
  }

  // Use the canonical key for the window (short form)
  const windowKey = Object.keys(API_MAP).find(
    k => API_MAP[k] === API_MAP[type] && k.length === 1
  ) || type;

  const prevWindow = [...windows[windowKey]];
  let numbers = [];

  try {
    const apiUrl = `http://20.244.56.144/evaluation-service/${API_MAP[type]}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      },
      signal: controller.signal
    });

    clearTimeout(timeout);
    const data = await response.json();
    console.log("Full API response:", data); // <-- log the entire response

    numbers = data.numbers || [];

    let merged = uniqueWindow([...windows[windowKey], ...numbers]);
    if (merged.length > WINDOW_SIZE) {
      merged = merged.slice(merged.length - WINDOW_SIZE);
    }
    windows[windowKey] = merged;

    const avg = merged.length > 0
      ? (merged.reduce((a, b) => a + b, 0) / merged.length).toFixed(2)
      : null;

    res.json({
      windowPrevState: prevWindow,
      windowCurrState: windows[windowKey],
      numbers,
      avg,
    });
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch or took too long" });
  }
});

const PORT = 9876;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
