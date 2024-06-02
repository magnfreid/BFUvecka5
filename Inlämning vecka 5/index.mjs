import { programmingJokes as programmingJokes } from "./data/jokes.mjs";
import readline from "node:readline";
import fetch from "node-fetch";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function random(from, to) {
  return Math.floor(Math.random() * (to - from + 1)) + from;
}

//Meny-item - Berätta X antal skämt från listan, invänta input innan svar på varje
function tellJoke() {
  rl.question(
    `Hur många skämt vill du ha? (1-${programmingJokes.length})\nAnge antal eller skriv "avbryt" för att avsluta.\n`,
    (userInput) => {
      if (parseInt(userInput) <= programmingJokes.length) {
        let tempJokes = programmingJokes.slice();
        let jokes = [];
        for (let i = 0; i < userInput; i++) {
          let randomIndex = random(0, tempJokes.length - 1);
          let joke = tempJokes.splice(randomIndex, 1)[0];
          jokes.push(joke);
        }
        printJokeAwaitAnswer(jokes);
      } else if (userInput.toLowerCase() == "avbryt") {
        console.log("Återgår..\n");
        main();
      } else {
        console.log("Felaktig input, försök igen.\n");
        tellJoke();
      }
    }
  );
}

//Fixa inväntande av input
async function printJokeAwaitAnswer(jokes) {
  let count = 1;
  for (const joke of jokes) {
    console.log(`Joke ${count}/${jokes.length}`);
    count++;
    console.log(joke.joke);
    await new Promise((resolve) => {
      rl.question(
        '\nVill du höra svaret? Skriv "ja", eller "avbryt" för att avsluta.\n',
        (userInput) => {
          if (userInput.toLowerCase() == "ja") {
            console.log(`Svar: ${joke.answer}\n`);
            resolve();
          } else if (userInput.toLowerCase() == "avbryt") {
            console.log("Tillbaka till huvudmenyn...");
            main();
          } else {
            console.log("Felaktig input, försök igen...");
            resolve();
          }
        }
      );
    });
  }
  main();
}

//Meny-item - visa alla skämt, radera, lägg till ny
function editJokes() {
  rl.question(
    `\n1. Visa alla skämt (${programmingJokes.length})\n2. Lägg till skämt\n3. Radera skämt\n4. Tillbaka\n`,
    (userInput) => {
      if (userInput == 1) {
        printAllJokes();
        editJokes();
      } else if (userInput == 2) {
        addJoke();
      } else if (userInput == 3) {
        removeJoke();
      } else if (userInput == 4) {
        main();
      } else {
        console.log("Felaktig input, försök igen...\n");
        editJokes();
      }
    }
  );
}

function printAllJokes() {
  let index = 0;
  programmingJokes.forEach((joke) => {
    console.log(`\nID: ${index + 1}`);
    console.log(`Joke: ${joke.joke}`);
    console.log(`Answer: ${joke.answer}`);
    index++;
  });
}

function removeJoke() {
  console.log(
    `Det finns totalt ${programmingJokes.length} skämt i databanken.`
  );
  rl.question(
    'Vilket vill du radera (ange ID)?\nSkriv "avbryt" för att återgå.\n',
    (userInput) => {
      if (
        parseInt(userInput) > 0 &&
        parseInt(userInput) <= programmingJokes.length
      ) {
        programmingJokes.splice(userInput - 1, 1)[0];
        editJokes();
      } else if (userInput.toLowerCase() == "avbryt") {
        editJokes();
      } else {
        console.log("Felaktig input, försök igen...\n");
        removeJoke();
      }
    }
  );
}

function addJoke() {
  let newJoke = "";
  let newAnswer = "";
  console.log('\nLägg till ett nytt skämt!\nSkriv "avbryt" för att avsluta.\n');
  rl.question("Vad är skämtet/frågan? Max 100 tecken!\n", (userInput) => {
    if (userInput.toLowerCase() == "avbryt") {
      main();
      return;
    } else if (userInput.length <= 100) {
      newJoke = userInput;
      rl.question("Vad är svaret? Max 50 tecken!\n", (userInput) => {
        if (userInput.toLowerCase() == "avbryt") {
          main();
          return;
        } else if (userInput.length <= 50) {
          newAnswer = userInput;
          programmingJokes.push({ joke: newJoke, answer: newAnswer });
          console.log("Skämtet har lagts till!\n");
          editJokes();
        } else {
          console.log("För långt, försök igen...\n");
          addJoke();
        }
      });
    } else {
      console.log("För långt, försök igen...\n");
      addJoke();
    }
  });
}

//Meny-item - hämta + printa random dad joke från api
async function fetchRandomDadJoke(format = "json") {
  try {
    const url = "https://icanhazdadjoke.com/";
    const headers = {
      Accept: format === "json" ? "application/json" : "text/plain",
    };

    const response = await fetch(url, { headers });

    if (response.ok) {
      const data = await response.json();
      return data.joke;
    } else {
      const errorMessage = await response.text();
      throw new Error(`Failed to fetch joke: ${errorMessage}`);
    }
  } catch (error) {
    console.error("Error fetching joke:", error.message);
    return null;
  }
}

async function apiJoke() {
  console.log("\nFrån: https://icanhazdadjoke.com/");
  const randomJoke = await fetchRandomDadJoke();
  console.log(`\nRandom Dad Joke:\n ${randomJoke}\n`);
  main();
}

//Main
function main() {
  console.log("*** Välkommen till Skämtmaskinen! ***");
  rl.question(
    "1. Dra skämt\n2. Skämt-meny\n3. Random API-skämt!\n4. Avsluta\n",
    (userInput) => {
      if (userInput == 1) {
        tellJoke();
      } else if (userInput == 2) {
        editJokes();
      } else if (userInput == 3) {
        apiJoke();
      } else if (userInput == 4) {
        process.exit();
      } else {
        console.log("Felaktig input, försök igen...\n");
        main();
      }
    }
  );
}

main();
