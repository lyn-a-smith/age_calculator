// checks if a string is made of digits only
function isOnlyDigits(text) {
  for (let i = 0; i < text.length; i++) {
    const character = text[i];
    if (character < "0" || character > "9") {
      return false;
    }
  }
  return true;
}

function validateBirthDate(input) {
  // if input is missing, treat it as an empty string
  if (input === null || input === undefined) {
    input = "";
  }

  const trimmedInput = input.trim(); // removes extra spaces at start/end

  if (trimmedInput === "") {
    return { valid: false, error: "Please enter your birthdate." };
  }

  // expected format: DD/MM/YYYY, so splitting by "/" should give 3 parts
  const parts = trimmedInput.split("/");

  if (parts.length !== 3) {
    return { valid: false, error: "Invalid date. Please use DD/MM/YYYY." };
  }

  const dayText = parts[0];
  const monthText = parts[1];
  const yearText = parts[2];

  if (dayText.length !== 2 || monthText.length !== 2 || yearText.length !== 4) {
    return { valid: false, error: "Invalid date. Please use DD/MM/YYYY." };
  }

  if (!isOnlyDigits(dayText) || !isOnlyDigits(monthText) || !isOnlyDigits(yearText)) {
    return { valid: false, error: "Invalid date. Please use DD/MM/YYYY." };
  }

  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);

  if (day <= 0 || month <= 0 || month > 12 || year <= 0) {
    return { valid: false, error: "Invalid date. Please use DD/MM/YYYY." };
  }

  // JS months are 0-indexed (0 = January), so we use month - 1 here.
  // This also handles leap years correctly on its own: JS's Date knows
  // February has 29 days in a leap year and 28 otherwise, so we don't
  // need to write any leap-year math ourselves.
  const date = new Date(year, month - 1, day);

  // JS "fixes" invalid dates instead of erroring (e.g. 30 Feb becomes 2 March,
  // and 29 Feb on a non-leap year becomes 1 March), so we check the date we
  // got back actually matches what we typed in.
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return { valid: false, error: "Invalid date. Please use DD/MM/YYYY." };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // ignore the current time, only compare the date

  if (date.getTime() > today.getTime()) {
    return { valid: false, error: "Date cannot be in the future." };
  }

  return { valid: true, date: date };
}

function calculateAge(birthDate, today) {
  if (today === undefined) {
    today = new Date();
  }

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  // if days is negative, borrow days from the previous month.
  // new Date(year, month, 0) gives the last day of the PREVIOUS month,
  // so this automatically returns 28 or 29 for February depending on
  // whether that year is a leap year - no extra leap-year logic needed.
  if (days < 0) {
    months = months - 1;
    const daysInLastMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days = days + daysInLastMonth;
  }

  // if months is still negative, borrow a year
  if (months < 0) {
    years = years - 1;
    months = months + 12;
  }

  return { years: years, months: months, days: days };
}

function formatAge(age) {
  return age.years + " years, " + age.months + " months and " + age.days + " days";
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return day + "/" + month + "/" + year;
}

// --- wiring up to Lyn's HTML (only runs in the browser, not in Node tests) ---
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("ageForm");
    const birthdateInput = document.getElementById("birthdate");
    const birthdateError = document.getElementById("birthdateError");
    const currentDateInput = document.getElementById("currentDate");
    const ageResult = document.getElementById("ageResult");

    currentDateInput.value = formatDate(new Date());

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const result = validateBirthDate(birthdateInput.value);

      if (!result.valid) {
        birthdateInput.classList.add("is-invalid");
        birthdateError.textContent = result.error;
        ageResult.textContent = "";
        return;
      }

      birthdateInput.classList.remove("is-invalid");
      birthdateError.textContent = "";
      ageResult.textContent = formatAge(calculateAge(result.date));
    });
  });
}

// testing stuff with node console
if (typeof module !== "undefined" && module.exports) {
  module.exports = { validateBirthDate, calculateAge, formatAge, formatDate };
}
