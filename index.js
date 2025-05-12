const express = require('express');
const app = express();
const port = 9876;

const { getWindow, addNumbers, getAverage } = require('./windowStore');
const { fetchNumbers } = require('./fetcher');

app.get('/numbers/:type', async (req, res) => {
  const type = req.params.type;
  if (!['p', 'f', 'e', 'r'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type' });
  }

  const windowPrevState = getWindow();

  const numbers = await fetchNumbers(type);
  addNumbers(numbers);

  const windowCurrState = getWindow();
  const avg = getAverage();

  res.json({
    windowPrevState,
    windowCurrState,
    numbers,
    avg
  });
});

app.listen(port, () => {
  console.log(`Average calculator microservice listening at http://localhost:${port}`);
});
