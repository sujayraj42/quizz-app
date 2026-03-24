const questions = [
  {
    id: "q1",
    prompt: "Which planet is known as the Red Planet?",
    choices: ["Earth", "Mars", "Jupiter", "Venus"],
    answerIndex: 1,
    theme: "cosmos",
  },
  {
    id: "q2",
    prompt: "What does HTML stand for?",
    choices: [
      "HyperText Markup Language",
      "High Transfer Machine Language",
      "Hyperlink and Text Management Language",
      "Home Tool Markup Language",
    ],
    answerIndex: 0,
    theme: "code",
  },
  {
    id: "q3",
    prompt: "Who wrote 'Romeo and Juliet'?",
    choices: [
      "William Shakespeare",
      "Charles Dickens",
      "Jane Austen",
      "Mark Twain",
    ],
    answerIndex: 0,
    theme: "literature",
  },
  {
    id: "q4",
    prompt: "Which data structure uses FIFO order?",
    choices: ["Stack", "Queue", "Tree", "Graph"],
    answerIndex: 1,
    theme: "logic",
  },
  {
    id: "q5",
    prompt: "What is the capital of Japan?",
    choices: ["Seoul", "Kyoto", "Tokyo", "Osaka"],
    answerIndex: 2,
    theme: "geography",
  },
  {
    id: "q6",
    prompt: "Which gas do plants absorb from the atmosphere?",
    choices: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
    answerIndex: 2,
    theme: "science",
  },
  {
    id: "q7",
    prompt: "In JavaScript, which keyword creates a block-scoped variable?",
    choices: ["var", "const", "define", "static"],
    answerIndex: 1,
    theme: "code",
  },
  {
    id: "q8",
    prompt: "How many continents are there on Earth?",
    choices: ["5", "6", "7", "8"],
    answerIndex: 2,
    theme: "geography",
  },
];

module.exports = {
  questions,
};
