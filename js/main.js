// HOMEWORK: The user will enter a cocktail. Get a cocktail name, photo, and instructions and place them in the DOM

// --- GLOBAL ELEMENTS & STATE ---
const alphabetContainer = document.querySelector('.alphabet');
const letterResultsDropdown = document.querySelector('.letter-results-dropdown');
let currentLetterDrinks = []; // drinks for the selected letter
const shakers = document.querySelectorAll('.shaker');
const searchInput = document.querySelector('input');
const ingredientInput = document.querySelector('#ingredient-input');
const shakeBtn = document.querySelector('#shake-btn');
const surpriseBtn = document.querySelector('#surprise-btn');
const ingredientBtn = document.querySelector('#ingredient-btn');
const methodSections = document.querySelectorAll('.cocktailMethod');
const drinkWindow = document.querySelector('.drink-window');
const tikiShutter = document.querySelector('.tiki-shutter'); 

// timing values in one place
const SHUTTER_PAUSE_MS = 500;  // time to stay closed before opening
const SHAKER_DELAY_MS = 1500;  // your existing shake delay

function fetchDrinkById(id) {
  return fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`)
    .then(res => res.json())
    .then(data => data.drinks[0]);
}

function withClosedShutter(swapCallback) {

  const shutterIsOpen = drinkWindow.classList.contains('open');

  // If shutter is open, close it first and wait
  if (shutterIsOpen) {
    drinkWindow.classList.remove('open');

    const onClose = (e) => {
      if (e.target !== tikiShutter || e.propertyName !== 'transform') return;

      tikiShutter.removeEventListener('transitionend', onClose);

      // Safe to swap while fully closed
      swapCallback();

      // Pause closed, then open
      setTimeout(() => {
        drinkWindow.classList.add('open');
      }, SHUTTER_PAUSE_MS);
    };

    tikiShutter.addEventListener('transitionend', onClose);

  } else {
    // Shutter already closed (first load OR rapid clicks)
    swapCallback();

    // Pause closed, then open
    setTimeout(() => {
      drinkWindow.classList.add('open');
    }, SHUTTER_PAUSE_MS);
  }
}

// --- RENDER A SINGLE DRINK INTO THE TIKI BAR ---
function renderDrink(drink) {
  // Title + main image
  document.querySelector('h2').innerText = drink.strDrink;
  document.querySelector('#drink-img').src = drink.strDrinkThumb;

  // Build ingredients + images
  let ingredientsList = '';
  let ingredientImages = '';

  for (let i = 1; i <= 15; i++) {
    const ing = drink[`strIngredient${i}`];
    const measure = drink[`strMeasure${i}`];

    if (!ing) continue;

    const cleanMeasure = measure ? measure.trim() : '';

    ingredientImages += `
      <img class="ingredient-icon"
           src="https://www.thecocktaildb.com/images/ingredients/${ing}-Small.png"
           alt="${ing}">
    `;

    ingredientsList += `<li>${cleanMeasure} ${ing}</li>`;
  }

  // Push content into DOM
  document.querySelector('.ingredient-images').innerHTML = ingredientImages;
  document.querySelector('.ingredients').innerHTML = ingredientsList;
  document.querySelector('.instructions').innerText = drink.strInstructions;

  // Reveal previously hidden sections (first ever drink)
  methodSections.forEach(section => section.classList.remove('hidden'));
}

// --- BUILD A–Z BUTTONS ---
for (let code = 65; code <= 90; code++) {  // 65 = 'A', 90 = 'Z'
  const letter = String.fromCharCode(code);
  const btn = document.createElement('button');
  btn.textContent = letter;
  btn.dataset.letter = letter.toLowerCase();
  alphabetContainer.appendChild(btn);
}

// --- MAIN "SHAKE" BUTTON / INPUT LOGIC ---
document.querySelector('#shake-btn').addEventListener('click', getDrink);
document.querySelector('#surprise-btn').addEventListener('click', getRandomDrink);
document.querySelector('#ingredient-btn').addEventListener('click', getDrinkByIngredient);

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    getDrink();
  }
});

ingredientInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    getDrinkByIngredient();
  }
});

function getDrink() {
  drinkWindow.classList.remove('open');

  letterResultsDropdown.classList.add('hidden');
  letterResultsDropdown.innerHTML = '';

  // Start shaking animation
  shakers.forEach(shaker => shaker.classList.add('shake'));

  setTimeout(() => {
    const choice = document.querySelector('input').value.trim();

    fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${choice}`)
      .then(res => res.json())
      .then(data => {
        const drinks = data.drinks;
        if (!drinks || drinks.length === 0) {
          document.querySelector('h2').innerText = 'No cocktails found';
          document.querySelector('#drink-img').src = '';
          document.querySelector('.ingredient-images').innerHTML = '';
          document.querySelector('.ingredients').innerHTML = '';
          document.querySelector('.instructions').innerText = '';
          return;
        }

        const randomIndex = Math.floor(Math.random() * drinks.length);
        const drink = drinks[randomIndex];

        console.log(drinks);

        withClosedShutter(() => renderDrink(drink)); 
      })
      .catch(err => console.log(err))
      .finally(() => {
        shakers.forEach(shaker => shaker.classList.remove('shake'));
      });

  }, SHAKER_DELAY_MS); 
}

function getRandomDrink() {
  drinkWindow.classList.remove('open');

  shakers.forEach(shaker => shaker.classList.add('shake'));

  setTimeout(() => {
    fetch('https://www.thecocktaildb.com/api/json/v1/1/random.php')
      .then(res => res.json())
      .then(data => {
        const drink = data.drinks[0];

        withClosedShutter(() => renderDrink(drink)); 
      })
      .catch(err => console.log(err))
      .finally(() => {
        shakers.forEach(shaker => shaker.classList.remove('shake'));
      });
  }, SHAKER_DELAY_MS);
}

function getDrinkByIngredient() {
  drinkWindow.classList.remove('open');

  shakers.forEach(shaker => shaker.classList.add('shake'));

  setTimeout(() => {
    const ingredient = ingredientInput.value.trim();

    if (!ingredient) {
      shakers.forEach(shaker => shaker.classList.remove('shake'));
      return;
    }

    fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${ingredient}`)
      .then(res => res.json())
      .then(async data => {
        const drinks = data.drinks;

        if (!drinks || drinks.length === 0) {
          document.querySelector('h2').innerText = 'No cocktails found';
          document.querySelector('#drink-img').src = '';
          document.querySelector('.ingredient-images').innerHTML = '';
          document.querySelector('.ingredients').innerHTML = '';
          document.querySelector('.instructions').innerText = '';
          return;
        }

        const randomIndex = Math.floor(Math.random() * drinks.length);
        const selected = drinks[randomIndex];

        const fullDrink = await fetchDrinkById(selected.idDrink);

        withClosedShutter(() => renderDrink(fullDrink)); 
      })
      .catch(err => console.log(err))
      .finally(() => {
        shakers.forEach(shaker => shaker.classList.remove('shake'));
      });

  }, SHAKER_DELAY_MS); 
}

// --- ALPHABET LIST LOGIC ---
alphabetContainer.addEventListener('click', e => {
  if (!e.target.matches('button')) return;

  const letter = e.target.dataset.letter;

  fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${letter}`)
    .then(res => res.json())
    .then(data => {
      currentLetterDrinks = data.drinks || [];

      letterResultsDropdown.innerHTML = '<option>Select a cocktail...</option>';
      letterResultsDropdown.classList.remove('hidden');

      currentLetterDrinks.forEach(drink => {
        const option = document.createElement('option');
        option.value = drink.idDrink;
        option.textContent = drink.strDrink;
        letterResultsDropdown.appendChild(option);
      });
    })
    .catch(err => console.log(err));
});

// When you click a cocktail name from the letter list
letterResultsDropdown.addEventListener('change', e => {
  const id = e.target.value;
  const drink = currentLetterDrinks.find(d => d.idDrink === id);

  if (drink) {
    drinkWindow.classList.remove('open');
    withClosedShutter(() => renderDrink(drink));
  }
});

// Other ideas
// ✨ Add measurements paired with ingredients (done)
// ✨ Add a “Shake another!” button
// ✨ Add a preloader animation (shaker gif?)
// ✨ Add keyboard Enter-key support
// ✨ Add “search by ingredient” mode (filter by gin, rum, whiskey, etc.)