const delay = (ms) => new Promise(res => setTimeout(res, ms));

const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

module.exports = { delay, randomChoice };