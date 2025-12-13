//The user will enter a cocktail. Get a cocktail name, photo, and instructions and place them in the DOM

// --- GLOBAL ELEMENTS & STATE ---
const alphabetContainer = document.querySelector('.alphabet');
const letterResultsDropdown = document.querySelector('.letter-results-dropdown');
let currentLetterDrinks = []; // drinks for the selected letter
const shakers = document.querySelectorAll('.shaker');
const searchInput = document.querySelector('input');

// --- RENDER A SINGLE DRINK INTO THE TIKI BAR ---
function renderDrink(drink) {
  // Title + main image
  document.querySelector('h2').innerText = drink.strDrink;
  document.querySelector('#drink-img').src = drink.strDrinkThumb;

// Ingredients + images
  let ingredientsList = '';
  let ingredientImages = '';

  for (let i = 1; i <= 15; i++) {
    const ing = drink[`strIngredient${i}`];
    const measure = drink[`strMeasure${i}`];

    if (!ing) continue; // skip empty slots

    const cleanMeasure = measure ? measure.trim() : '';

    ingredientImages += `
      <img class="ingredient-icon"
           src="https://www.thecocktaildb.com/images/ingredients/${ing}-Small.png"
           alt="${ing}">
    `;

    ingredientsList += `<li>${cleanMeasure} ${ing}</li>`;
  }

  document.querySelector('.ingredient-images').innerHTML = ingredientImages;
  document.querySelector('.ingredients').innerHTML = ingredientsList;
  document.querySelector('.instructions').innerText = drink.strInstructions;
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

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    getDrink();
  }
});

function getDrink() {

  letterResultsDropdown.classList.add('hidden');
  letterResultsDropdown.innerHTML = '';

  // Start shaking animation
  shakers.forEach(shaker => shaker.classList.add('shake'));

  // Delay the fetch by 1.5s while shaking happens
  setTimeout(() => {
    const choice = document.querySelector('input').value.trim();

    fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${choice}`)
      .then(res => res.json())
      .then(data => {
        const drinks = data.drinks;
        if (!drinks || drinks.length === 0) {
          // simple "no results" handling
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
        renderDrink(drink);
      })
      .catch(err => console.log(err))
      .finally(() => {
        // Stop shaking after fetch completes
        shakers.forEach(shaker => shaker.classList.remove('shake'));
      });

  }, 1500); // 1.5 seconds of shaking
}

// --- ALPHABET LIST LOGIC ---
alphabetContainer.addEventListener('click', e => {
  if (!e.target.matches('button')) return;

  const letter = e.target.dataset.letter;

  fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${letter}`)
    .then(res => res.json())
    .then(data => {
      currentLetterDrinks = data.drinks || [];

      // Clear and show dropdown
      letterResultsDropdown.innerHTML = '<option>Select a cocktail...</option>';
      letterResultsDropdown.classList.remove('hidden');

      // Populate dropdown
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
    renderDrink(drink);
  }
});

// Homework tasks
// Make the cocktailDB API work with spaces between the names (i.e Dark and Stormy)
// Find three APIs and build three simple apps using those APIs (github public API list)

// Other vibe-coding ideas
// ✨ Add measurements paired with ingredients (done)
// ✨ Add a “Shake another!” button
// ✨ Add a preloader animation (shaker gif?)
// ✨ Add keyboard Enter-key support
// ✨ Add “search by ingredient” mode (filter by gin, rum, whiskey, etc.)