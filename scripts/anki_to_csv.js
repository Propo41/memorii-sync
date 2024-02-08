import { readFile, writeFile } from 'fs';
import axios from 'axios';
import convert from 'xml-js';

const readFromFile = (path) => {
  return new Promise((resolve, reject) => {
    readFile(path, 'utf8', (err, data) => {
      if (err) {
        reject('Error reading file');
        return;
      }
      resolve(data);
    });
  });
};

const saveFile = (path, data) => {
  return new Promise((resolve, reject) => {
    writeFile(path, data, 'utf8', (err) => {
      if (err) {
        reject('Error reading file');
        return;
      }
      resolve(data);
    });
  });
};

const extractWords = (data) => {
  const cards = data.split('\n');
  let words = [];

  for (const card of cards) {
    let columns = card.trim().split('\t');
    words.push(columns[0].split(' ')[0]);
  }

  return words;
};

const main = async () => {
  const filePath = 'sets/IELTS - Lesson 04.txt';
  const data = await readFromFile(filePath);
  const words = extractWords(data);

  let result = '';
  let i = 1;
  for (const word of words) {
    try {
      const { data } = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      console.log('Fetched ', word, i);

      if (!data && data.length === 0) {
        result += 'undefined\n';
      }
      const { phonetics, title } = data[0];
      if (title) {
        // if title exists then the meaning is not defined
        result += 'undefined\n';
        continue;
      }

      let audioExist = false;
      for (const phonetic of phonetics) {
        if (phonetic.audio) {
          result += `${phonetic.audio}\n`;
          audioExist = true;
          break;
        }
      }
      if (!audioExist) {
        result += 'undefined\n';
      }

      i++;
    } catch (error) {
      result += 'undefined\n';
      continue;
    }
  }

  // const xml = convert.js2xml({ words: { word: result } }, { compact: true, spaces: 2 });
  saveFile(`output.txt`, result);
};

main();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const extractSaveWords = async () => {
  const filePath = 'sets/Phrasal verbs.txt';
  const data = await readFromFile(filePath);
  // const words = extractWords(data);
  const lines = data.split('\n');
  let result = '';
  for (const line of lines) {
    const trimmed = line.trim().split('\t');
    for (const col of trimmed) {
      result += `${col},`;
    }
    result += '\n';
  }

  // const xml = convert.js2xml({ words: { word: result } }, { compact: true, spaces: 2 });
  saveFile('phrasal_verbs.csv', result);
};

//extractSaveWords();
