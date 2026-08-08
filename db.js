const fs = require('fs');
const path = './data/users.json';

function readData() {
    const raw = fs.readFileSync(path, 'utf-8');
    return JSON.parse(raw);
}

function writeData(data) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

module.exports = { readData, writeData };