const assert = require("assert");
const { validateBirthDate, calculateAge, formatAge } = require("./age_calculator.js");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`FAIL: ${name}`);
    console.error(`  ${err.message}`);
    failed++;
  }
}

// story 2 stuff

test("empty input shows the empty-input message", () => {
  const result = validateBirthDate("");
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.error, "Please enter your birthdate.");
});

test("whitespace-only input is treated as empty", () => {
  const result = validateBirthDate("   ");
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.error, "Please enter your birthdate.");
});

test("letters are rejected with the format message", () => {
  const result = validateBirthDate("aa/bb/cccc");
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.error, "Invalid date. Please use DD/MM/YYYY.");
});

test("special characters are rejected with the format message", () => {
  const result = validateBirthDate("12-03-2000");
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.error, "Invalid date. Please use DD/MM/YYYY.");
});

test("wrong format (single-digit day/month) is rejected", () => {
  const result = validateBirthDate("1/3/2000");
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.error, "Invalid date. Please use DD/MM/YYYY.");
});

test("non-existent date (30/02) is rejected", () => {
  const result = validateBirthDate("30/02/2025");
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.error, "Invalid date. Please use DD/MM/YYYY.");
});

test("negative-like / zero day or month is rejected", () => {
  const result = validateBirthDate("00/00/2000");
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.error, "Invalid date. Please use DD/MM/YYYY.");
});

test("future date is rejected with the future-date message", () => {
  const future = new Date();
  future.setFullYear(future.getFullYear() + 1);
  const dd = String(future.getDate()).padStart(2, "0");
  const mm = String(future.getMonth() + 1).padStart(2, "0");
  const yyyy = future.getFullYear();
  const result = validateBirthDate(`${dd}/${mm}/${yyyy}`);
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.error, "Date cannot be in the future.");
});

test("valid past date is accepted", () => {
  const result = validateBirthDate("15/06/2000");
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.date.getFullYear(), 2000);
  assert.strictEqual(result.date.getMonth(), 5); // 0-indexed
  assert.strictEqual(result.date.getDate(), 15);
});

// story 3 stuff

test("same-day birthdate returns 0 years, 0 months, 0 days", () => {
  const today = new Date(2026, 7, 19); // 19 Aug 2026
  const birth = new Date(2026, 7, 19);
  const age = calculateAge(birth, today);
  assert.deepStrictEqual(age, { years: 0, months: 0, days: 0 });
});

test("same-day birthdate displays as \"0 years, 0 months, 0 days\"", () => {
  const today = new Date(2026, 7, 19);
  const birth = new Date(2026, 7, 19);
  const age = calculateAge(birth, today);
  assert.strictEqual(formatAge(age), "0 years, 0 months, 0 days");
});

test("exact anniversary counts a full year, 0 months, 0 days", () => {
  const today = new Date(2026, 7, 19);
  const birth = new Date(2000, 7, 19);
  const age = calculateAge(birth, today);
  assert.deepStrictEqual(age, { years: 26, months: 0, days: 0 });
});

test("day borrow works across a shorter month", () => {
  const today = new Date(2026, 2, 1); // 1 Mar 2026
  const birth = new Date(2000, 1, 15); // 15 Feb 2000
  const age = calculateAge(birth, today);
  assert.deepStrictEqual(age, { years: 26, months: 0, days: 14 });
});

// LEAP YEAR

test("29 Feb is accepted on a leap year", () => {
  const result = validateBirthDate("29/02/2000"); // 2000 is a leap year
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.date.getMonth(), 1); // February
  assert.strictEqual(result.date.getDate(), 29);
});

test("29 Feb is rejected on a non-leap year", () => {
  const result = validateBirthDate("29/02/2001"); // 2001 is not a leap year
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.error, "Invalid date. Please use DD/MM/YYYY.");
});

test("age calculation borrows the correct number of days across a leap February", () => {
  const today = new Date(2024, 2, 1); // 1 Mar 2024 (2024 is a leap year)
  const birth = new Date(2000, 1, 15); // 15 Feb 2000
  const age = calculateAge(birth, today);
  assert.deepStrictEqual(age, { years: 24, months: 0, days: 15 });
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
