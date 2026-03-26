const mongoose = require("mongoose");
const { Question } = require("../server/db/models");
const { connectDB, disconnectDB } = require("../server/db/connection");
require("dotenv").config();

const sampleQuestions = [
  {
    questionId: "q001",
    prompt: "What is the capital of France?",
    choices: [{ text: "Berlin", index: 0 }, { text: "Madrid", index: 1 }, { text: "Paris", index: 2 }, { text: "Rome", index: 3 }],
    answerIndex: 2,
    category: "geography",
    difficulty: 1,
    explanation: "Paris is the capital and most populous city of France.",
    tags: ["capital", "europe"],
    createdBy: "seed_script"
  },
  {
    questionId: "q002",
    prompt: "Which planet is known as the Red Planet?",
    choices: [{ text: "Mars", index: 0 }, { text: "Jupiter", index: 1 }, { text: "Venus", index: 2 }, { text: "Saturn", index: 3 }],
    answerIndex: 0,
    category: "science",
    difficulty: 1,
    explanation: "Mars appears red due to iron oxide on its surface.",
    tags: ["planets", "space"],
    createdBy: "seed_script"
  },
  {
    questionId: "q003",
    prompt: "Who wrote 'Hamlet'?",
    choices: [{ text: "Charles Dickens", index: 0 }, { text: "William Shakespeare", index: 1 }, { text: "Mark Twain", index: 2 }, { text: "Jane Austen", index: 3 }],
    answerIndex: 1,
    category: "literature",
    difficulty: 2,
    explanation: "Hamlet is a tragedy written by William Shakespeare.",
    tags: ["shakespeare", "plays"],
    createdBy: "seed_script"
  },
  {
    questionId: "q004",
    prompt: "What is the largest ocean on Earth?",
    choices: [{ text: "Atlantic Ocean", index: 0 }, { text: "Indian Ocean", index: 1 }, { text: "Arctic Ocean", index: 2 }, { text: "Pacific Ocean", index: 3 }],
    answerIndex: 3,
    category: "geography",
    difficulty: 1,
    explanation: "The Pacific Ocean is the largest and deepest of Earth's oceanic divisions.",
    tags: ["ocean", "earth"],
    createdBy: "seed_script"
  },
  {
    questionId: "q005",
    prompt: "What does HTTP stand for?",
    choices: [{ text: "HyperText Transfer Protocol", index: 0 }, { text: "HyperText Transmission Protocol", index: 1 }, { text: "HyperText Transfer System", index: 2 }, { text: "HyperText Transfer Technology", index: 3 }],
    answerIndex: 0,
    category: "technology",
    difficulty: 2,
    explanation: "HTTP is the foundation of data communication for the World Wide Web.",
    tags: ["web", "internet"],
    createdBy: "seed_script"
  },
  {
    questionId: "q006",
    prompt: "In what year did World War II end?",
    choices: [{ text: "1940", index: 0 }, { text: "1943", index: 1 }, { text: "1945", index: 2 }, { text: "1948", index: 3 }],
    answerIndex: 2,
    category: "history",
    difficulty: 2,
    explanation: "World War II ended in 1945 after the unconditional surrender of the Axis powers.",
    tags: ["war", "ww2"],
    createdBy: "seed_script"
  },
  {
    questionId: "q007",
    prompt: "Which gas is most abundant in the Earth's atmosphere?",
    choices: [{ text: "Oxygen", index: 0 }, { text: "Carbon Dioxide", index: 1 }, { text: "Nitrogen", index: 2 }, { text: "Hydrogen", index: 3 }],
    answerIndex: 2,
    category: "science",
    difficulty: 2,
    explanation: "Nitrogen makes up about 78% of the Earth's atmosphere.",
    tags: ["atmosphere", "gas"],
    createdBy: "seed_script"
  },
  {
    questionId: "q008",
    prompt: "What is the square root of 144?",
    choices: [{ text: "10", index: 0 }, { text: "11", index: 1 }, { text: "12", index: 2 }, { text: "13", index: 3 }],
    answerIndex: 2,
    category: "math",
    difficulty: 1,
    explanation: "12 * 12 = 144",
    tags: ["arithmetic", "numbers"],
    createdBy: "seed_script"
  },
  {
    questionId: "q009",
    prompt: "Which element has the chemical symbol 'O'?",
    choices: [{ text: "Osmium", index: 0 }, { text: "Oxygen", index: 1 }, { text: "Gold", index: 2 }, { text: "Oganesson", index: 3 }],
    answerIndex: 1,
    category: "science",
    difficulty: 1,
    explanation: "Oxygen is a chemical element with symbol O and atomic number 8.",
    tags: ["chemistry", "elements"],
    createdBy: "seed_script"
  },
  {
    questionId: "q010",
    prompt: "Who painted the Mona Lisa?",
    choices: [{ text: "Vincent van Gogh", index: 0 }, { text: "Pablo Picasso", index: 1 }, { text: "Leonardo da Vinci", index: 2 }, { text: "Claude Monet", index: 3 }],
    answerIndex: 2,
    category: "art",
    difficulty: 2,
    explanation: "The Mona Lisa is a half-length portrait painting by Italian artist Leonardo da Vinci.",
    tags: ["painting", "history"],
    createdBy: "seed_script"
  },
  {
    questionId: "q011",
    prompt: "What is the smallest prime number?",
    choices: [{ text: "0", index: 0 }, { text: "1", index: 1 }, { text: "2", index: 2 }, { text: "3", index: 3 }],
    answerIndex: 2,
    category: "math",
    difficulty: 1,
    explanation: "A prime number is a natural number greater than 1 that is not a product of two smaller natural numbers.",
    tags: ["prime", "numbers"],
    createdBy: "seed_script"
  },
  {
    questionId: "q012",
    prompt: "In computing, what does CPU stand for?",
    choices: [{ text: "Central Process Unit", index: 0 }, { text: "Computer Personal Unit", index: 1 }, { text: "Central Processing Unit", index: 2 }, { text: "Central Processor Unit", index: 3 }],
    answerIndex: 2,
    category: "technology",
    difficulty: 1,
    explanation: "A CPU is the electronic circuitry that executes instructions comprising a computer program.",
    tags: ["hardware", "computer"],
    createdBy: "seed_script"
  },
  {
    questionId: "q013",
    prompt: "Which continent is the Sahara Desert located on?",
    choices: [{ text: "Asia", index: 0 }, { text: "South America", index: 1 }, { text: "Africa", index: 2 }, { text: "Australia", index: 3 }],
    answerIndex: 2,
    category: "geography",
    difficulty: 2,
    explanation: "The Sahara is a desert spanning across Northern Africa.",
    tags: ["desert", "continents"],
    createdBy: "seed_script"
  },
  {
    questionId: "q014",
    prompt: "How many bones are in the adult human body?",
    choices: [{ text: "206", index: 0 }, { text: "205", index: 1 }, { text: "201", index: 2 }, { text: "208", index: 3 }],
    answerIndex: 0,
    category: "science",
    difficulty: 3,
    explanation: "The human skeleton of an adult consists of 206 bones.",
    tags: ["anatomy", "biology"],
    createdBy: "seed_script"
  },
  {
    questionId: "q015",
    prompt: "What is the speed of light in a vacuum?",
    choices: [{ text: "~300,000 km/s", index: 0 }, { text: "~150,000 km/s", index: 1 }, { text: "~400,000 km/s", index: 2 }, { text: "~500,000 km/s", index: 3 }],
    answerIndex: 0,
    category: "science",
    difficulty: 3,
    explanation: "The speed of light in vacuum is exactly 299,792,458 metres per second.",
    tags: ["physics", "light"],
    createdBy: "seed_script"
  },
  {
    questionId: "q016",
    prompt: "What is the hardest natural substance on Earth?",
    choices: [{ text: "Gold", index: 0 }, { text: "Iron", index: 1 }, { text: "Diamond", index: 2 }, { text: "Platinum", index: 3 }],
    answerIndex: 2,
    category: "science",
    difficulty: 2,
    explanation: "Diamond is the hardest known natural material.",
    tags: ["minerals", "geology"],
    createdBy: "seed_script"
  },
  {
    questionId: "q017",
    prompt: "What data structure operates on a Last In, First Out (LIFO) principle?",
    choices: [{ text: "Queue", index: 0 }, { text: "Tree", index: 1 }, { text: "Graph", index: 2 }, { text: "Stack", index: 3 }],
    answerIndex: 3,
    category: "technology",
    difficulty: 2,
    explanation: "A stack is a linear data structure that follows the LIFO principle.",
    tags: ["computer science", "algorithms"],
    createdBy: "seed_script"
  },
  {
    questionId: "q018",
    prompt: "Which country has the largest population in the world?",
    choices: [{ text: "USA", index: 0 }, { text: "India", index: 1 }, { text: "China", index: 2 }, { text: "Russia", index: 3 }],
    answerIndex: 1,
    category: "geography",
    difficulty: 2,
    explanation: "India recently surpassed China as the most populous country in the world.",
    tags: ["population", "countries"],
    createdBy: "seed_script"
  },
  {
    questionId: "q019",
    prompt: "Who is known as the father of modern physics?",
    choices: [{ text: "Isaac Newton", index: 0 }, { text: "Albert Einstein", index: 1 }, { text: "Galileo Galilei", index: 2 }, { text: "Niels Bohr", index: 3 }],
    answerIndex: 1,
    category: "science",
    difficulty: 2,
    explanation: "Albert Einstein is often regarded as the father of modern physics due to his theory of relativity.",
    tags: ["physics", "history"],
    createdBy: "seed_script"
  },
  {
    questionId: "q020",
    prompt: "What is the meaning of 'GSD' in the context of this project workspace?",
    choices: [{ text: "Good Software Design", index: 0 }, { text: "Get Shit Done", index: 1 }, { text: "Global System Defaults", index: 2 }, { text: "Generic String Data", index: 3 }],
    answerIndex: 1,
    category: "general",
    difficulty: 1,
    explanation: "GSD stands for Get Shit Done, an internal framework used to quickly iterate on features.",
    tags: ["meta", "trivia"],
    createdBy: "seed_script"
  }
];

async function seedDatabase() {
  try {
    const connection = await connectDB();
    if (!connection) {
      console.log("MongoDB is not configured or reachable. Cannot run seed script in memory mode.");
      process.exit(1);
    }
    
    console.log("Connected to MongoDB. Purging old sample questions...");
    await Question.deleteMany({ createdBy: "seed_script" });
    
    console.log("Inserting 20 diverse sample questions...");
    const result = await Question.insertMany(sampleQuestions);
    console.log(`Successfully seeded ${result.length} questions!`);
    
    await disconnectDB();
    console.log("Database disconnected.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
