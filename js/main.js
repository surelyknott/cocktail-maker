//The user will enter a cocktail. Get a cocktail name, photo, and instructions and place them in the DOM

// Declare the shakers
const shakers = document.querySelectorAll('.shaker');

document.querySelector('button').addEventListener('click', getDrink)

function getDrink(){

  // Start shaking animation
  shakers.forEach(shaker => shaker.classList.add('shake'));

  // Delay the fetch by 2 seconds while shaking happens
  setTimeout(() => {

  let choice = document.querySelector('input').value

  fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${choice}`)
      .then(res => res.json()) // parse response as JSON
      .then(data => {

        let drinks = data.drinks
        let randomIndex = Math.floor(Math.random() * drinks.length)
        let drink = drinks[randomIndex]

        console.log(data.drinks)

        document.querySelector('h2').innerText = drink.strDrink
        document.querySelector('#drink-img').src = drink.strDrinkThumb

       let ingredientsList = '';
       let ingredientImages = '';

       for (let i = 1; i <= 15; i++) {
        
       let ing = drink[`strIngredient${i}`];
       let measure = drink[`strMeasure${i}`];

       if (ing) {

        // Clean up measurement
        let cleanMeasure = measure ? measure.trim() : "";

        // Add ingredient image
        ingredientImages += `
        <img class="ingredient-icon"
            src="https://www.thecocktaildb.com/images/ingredients/${ing}-Small.png"
            alt="${ing}">
        `;

        // Add list entry with measurement
        ingredientsList += `
        <li>${cleanMeasure} ${ing}</li>
        `;
        }
    }
    // Push into the DOM
    document.querySelector('.ingredient-images').innerHTML = ingredientImages;
    document.querySelector('.ingredients').innerHTML = ingredientsList;
    document.querySelector('.instructions').innerText = drink.strInstructions
        
      })
    .catch(err => console.log(err))
      .finally(() => {
        // Stop shaking after fetch completes
        shakers.forEach(shaker => shaker.classList.remove('shake'));
      });

    }, 1500); // 1.5 seconds of shaking
}

// Homework tasks
// Make the cocktailDB API work with spaces between the names (i.e Dark and Stormy)
// Find three APIs and build three simple apps using those APIs (github public API list)

// Other vibe-coding ideas
// ✨ Add measurements paired with ingredients (done)
// ✨ Add a “Shake another!” button
// ✨ Add a preloader animation (shaker gif?)
// ✨ Add keyboard Enter-key support
// ✨ Add “search by ingredient” mode (filter by gin, rum, whiskey, etc.)