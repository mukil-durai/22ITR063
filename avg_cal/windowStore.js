const WINDOW_SIZE = 10;
let numberWindow = [];

function getWindow() {
  return [...numberWindow];
}

function addNumbers(newNumbers) {
  const uniqueNewNumbers = newNumbers.filter(num => !numberWindow.includes(num));
  numberWindow = [...numberWindow, ...uniqueNewNumbers];
  if (numberWindow.length > WINDOW_SIZE) {
    numberWindow = numberWindow.slice(-WINDOW_SIZE);
  }
}

function getAverage() {
  if (numberWindow.length === 0) return 0;
  const sum = numberWindow.reduce((a, b) => a + b, 0);
  return parseFloat((sum / numberWindow.length).toFixed(2));
}

module.exports = {
  getWindow,
  addNumbers,
  getAverage
};
