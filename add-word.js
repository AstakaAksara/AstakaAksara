#!/usr/bin/env node
// Simple Node CLI to add a word to AstakaAksara.json
// Usage:
//   node add-word.js             -> interactive prompts
//   node add-word.js --word "..." --jawi "..." --meaning "..."  -> non-interactive
//
// The script validates JSON, prevents duplicate 'word' (case-insensitive),
// and writes the file with 2-space indentation.

const fs = require('fs');
const path = require('path');
const readline = require('readline/promises');
const { stdin: input, stdout: output } = require('process');

const FILE = process.env.ASTAKA_FILE || path.join(process.cwd(), 'AstakaAksara.json');

function parseArgs() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
      args[key] = val;
    }
  }
  return args;
}

async function promptIfMissing(args) {
  const rl = readline.createInterface({ input, output });
  const result = { ...args };

  if (!result.word) {
    result.word = (await rl.question('Word: ')).trim();
  }
  if (!('jawi' in result)) {
    result.jawi = (await rl.question('Jawi (optional): ')).trim();
  }
  if (!result.meaning) {
    result.meaning = (await rl.question('Meaning: ')).trim();
  }

  await rl.close();
  return result;
}

function loadJsonFile(file) {
  if (!fs.existsSync(file)) {
    return [];
  }
  const raw = fs.readFileSync(file, 'utf8');
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) throw new Error('JSON root is not an array');
    return data;
  } catch (err) {
    throw new Error(`Failed to parse ${file}: ${err.message}`);
  }
}

function saveJsonFile(file, arr) {
  fs.writeFileSync(file, JSON.stringify(arr, null, 2) + '\n', 'utf8');
}

(async function main() {
  try {
    const args = parseArgs();
    const values = await promptIfMissing(args);

    if (!values.word) {
      console.error('Error: word is required.');
      process.exit(1);
    }
    if (!values.meaning) {
      console.error('Error: meaning is required.');
      process.exit(1);
    }

    const list = loadJsonFile(FILE);

    const duplicate = list.find(
      (e) => String(e.word).toLowerCase() === String(values.word).toLowerCase()
    );
    if (duplicate) {
      console.error(`Error: a word "${duplicate.word}" already exists. Aborting.`);
      process.exit(1);
    }

    const entry = {
      word: values.word,
      jawi: values.jawi ?? '',
      meaning: values.meaning
    };

    list.push(entry);

    // Optional: keep list sorted by word (uncomment to enable)
    // list.sort((a, b) => String(a.word).localeCompare(String(b.word), undefined, { sensitivity: 'base' }));

    saveJsonFile(FILE, list);
    console.log(`Added "${entry.word}" to ${FILE}.`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();