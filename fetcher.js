const axios = require('axios');

const sourceMap = {
  p: 'primes',
  f: 'fibo',
  e: 'even',
  r: 'rand'
};

async function fetchNumbers(type) {
  const path = sourceMap[type];
  if (!path) throw new Error('Invalid type');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 500);

    const response = await axios.get(`http://20.244.56.144/evaluation-service/${path}`, {
      signal: controller.signal
    });

    clearTimeout(timeout);
    return response.data.numbers;
  } catch (err) {
    return [];
  }
}

module.exports = { fetchNumbers };
