/**
 * Question Generator
 * AI-powered question generation from templates and patterns
 * Supports dynamic question creation
 */

class QuestionGenerator {
  constructor() {
    this.questionTemplates = this._loadTemplates();
  }

  /**
   * Generate questions from templates
   * @param {object} params - { category, difficulty, count, topic }
   * @returns {array} Generated questions
   */
  generateQuestions(params = {}) {
    const { category = 'general', difficulty = 'medium', count = 5, topic = '' } = params;

    const generated = [];
    for (let i = 0; i < count; i++) {
      const question = this._generateQuestion(category, difficulty, topic);
      if (question) {
        generated.push(question);
      }
    }

    return generated;
  }

  /**
   * Generate a single question
   * @private
   */
  _generateQuestion(category, difficulty, topic) {
    const templates = this.questionTemplates[category] || this.questionTemplates.general;

    if (templates.length === 0) {
      return null;
    }

    const template = templates[Math.floor(Math.random() * templates.length)];
    const difficultyMultiplier =
      difficulty === 'easy' ? 1 : difficulty === 'hard' ? 3 : 2;

    return {
      id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      prompt: template.prompt,
      choices: template.choices,
      answerIndex: template.answerIndex,
      category,
      difficulty,
      theme: category,
      generated: true,
    };
  }

  /**
   * Load question templates
   * @private
   */
  _loadTemplates() {
    return {
      general: [
        {
          prompt: 'What is the capital of France?',
          choices: ['Paris', 'Lyon', 'Marseille', 'Toulouse'],
          answerIndex: 0,
        },
        {
          prompt: 'Which planet is closest to the Sun?',
          choices: ['Mercury', 'Venus', 'Earth', 'Mars'],
          answerIndex: 0,
        },
      ],
      science: [
        {
          prompt: 'What is the chemical symbol for Gold?',
          choices: ['Go', 'Au', 'Gd', 'Ag'],
          answerIndex: 1,
        },
        {
          prompt: 'How many bones are in the human body?',
          choices: ['186', '206', '216', '226'],
          answerIndex: 1,
        },
      ],
      history: [
        {
          prompt: 'In what year did World War II end?',
          choices: ['1943', '1944', '1945', '1946'],
          answerIndex: 2,
        },
        {
          prompt: 'Who was the first President of the USA?',
          choices: ['Thomas Jefferson', 'George Washington', 'John Adams', 'Benjamin Franklin'],
          answerIndex: 1,
        },
      ],
      programming: [
        {
          prompt: 'What does API stand for?',
          choices: [
            'Application Programming Interface',
            'Application Process Integration',
            'Advanced Programming Instruction',
            'Automated Programming Interface',
          ],
          answerIndex: 0,
        },
        {
          prompt: 'Which is not a programming language?',
          choices: ['Python', 'HTML', 'JavaScript', 'Java'],
          answerIndex: 1,
        },
      ],
      mathematics: [
        {
          prompt: 'What is 15 × 12?',
          choices: ['190', '200', '180', '210'],
          answerIndex: 2,
        },
        {
          prompt: 'What is the square root of 144?',
          choices: ['10', '11', '12', '13'],
          answerIndex: 2,
        },
      ],
    };
  }

  /**
   * Create a custom question
   * @param {object} questionData
   * @returns {object} Created question
   */
  createCustomQuestion(questionData) {
    const { prompt, choices, answerIndex, category = 'general', difficulty = 'medium' } =
      questionData;

    if (!prompt || !choices || choices.length < 2 || answerIndex === undefined) {
      throw new Error('Invalid question data');
    }

    return {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      prompt,
      choices,
      answerIndex,
      category,
      difficulty,
      theme: category,
      custom: true,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Validate question format
   * @param {object} question
   * @returns {object} Validation result
   */
  validateQuestion(question) {
    const errors = [];

    if (!question.prompt || typeof question.prompt !== 'string') {
      errors.push('Prompt must be a non-empty string');
    }

    if (!Array.isArray(question.choices) || question.choices.length < 2) {
      errors.push('Must have at least 2 choices');
    }

    if (question.choices.length > 6) {
      errors.push('Maximum 6 choices allowed');
    }

    if (!Number.isInteger(question.answerIndex) || question.answerIndex < 0 || question.answerIndex >= question.choices.length) {
      errors.push('Answer index must be valid index in choices');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get available categories
   */
  getAvailableCategories() {
    return Object.keys(this.questionTemplates);
  }

  /**
   * Export templates
   */
  exportTemplates() {
    return this.questionTemplates;
  }

  /**
   * Import custom templates
   */
  importTemplates(templates) {
    this.questionTemplates = {
      ...this.questionTemplates,
      ...templates,
    };
  }
}

module.exports = { QuestionGenerator };
