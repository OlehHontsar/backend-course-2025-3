#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const readline = require('readline');

// Налаштування параметрів командного рядка
program
  .requiredOption('-i, --input <path>', 'шлях до файлу для читання')
  .option('-o, --output <path>', 'шлях до файлу для запису')
  .option('-d, --display', 'вивести результат у консоль')
  .option('-c, --cylinders', 'відображати кількість циліндрів')
  .option('-m, --mpg <value>', 'відображати лише записи з паливною економністю нижче за зазначену', parseFloat);

program.parse(process.argv);

// Отримання опцій
const options = program.opts();
const inputFile = options.input;
const outputFile = options.output;
const display = options.display;
const showCylinders = options.cylinders;
const filterMpg = options.mpg;

// Перевірка наявності вхідного файлу
if (!fs.existsSync(inputFile)) {
  console.error("Помилка: Не вдалося знайти вхідний файл");
  process.exit(1);
}

// Використання readline для потокового читання файлу рядок за рядком
const fileStream = fs.createReadStream(inputFile);
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let result = [];

// Обробка кожного рядка
rl.on('line', (line) => {
  // Пропускаємо порожні рядки
  if (line.trim() === '') return;
  
  try {
    const car = JSON.parse(line);
    
    // Фільтрація за значенням mpg
    if (filterMpg !== undefined && car.mpg >= filterMpg) {
      return;
    }

    let record = `${car.model}`;
    if (showCylinders) {
      record += ` ${car.cyl}`;
    }
    record += ` ${car.mpg}`;
    result.push(record);
  } catch (error) {
    console.error("Помилка: Не вдалося розібрати рядок JSON:", error.message);
  }
});

// Запис або виведення результату після завершення читання
rl.on('close', () => {
  const output = result.join('\n');

  if (outputFile) {
    try {
      fs.writeFileSync(outputFile, output, 'utf-8');
      if (display) {
        console.log(output);
      }
    } catch (error) {
      console.error("Помилка: Не вдалося записати в вихідний файл:", error.message);
      process.exit(1);
    }
  } else if (display) {
    console.log(output);
  }
});