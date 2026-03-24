/**
 * Database Initialization Script
 * Run once to create initial data and verify MongoDB connection
 * 
 * Usage: npm run db:init
 */

const mongoose = require('mongoose');
require('dotenv').config();

const db = require('./db/database');
const { connectDB, disconnectDB } = require('./db/connection');

async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connected\n');

    // Create sample questions
    console.log('❓ Adding sample questions...');
    const sampleQuestions = [
      {
        text: 'What is the capital of India?',
        options: ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad'],
        answer: 0,
        category: 'geography',
        difficulty: 1,
        explanation: 'Delhi is the capital of India.'
      },
      {
        text: 'What is 15 × 12?',
        options: ['150', '180', '200', '220'],
        answer: 1,
        category: 'math',
        difficulty: 2,
        explanation: '15 × 12 = 180'
      },
      {
        text: 'Which planet is known as the Red Planet?',
        options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
        answer: 1,
        category: 'science',
        difficulty: 2,
        explanation: 'Mars is known as the Red Planet due to iron oxide on its surface.'
      },
      {
        text: 'What is the square root of 144?',
        options: ['10', '12', '14', '16'],
        answer: 1,
        category: 'math',
        difficulty: 1,
        explanation: '√144 = 12'
      },
      {
        text: 'In which year did India become independent?',
        options: ['1945', '1947', '1950', '1952'],
        answer: 1,
        category: 'history',
        difficulty: 2,
        explanation: 'India became independent on August 15, 1947.'
      }
    ];

    for (const question of sampleQuestions) {
      await db.addQuestion(question);
    }
    console.log(`✅ Added ${sampleQuestions.length} sample questions\n`);

    // Create sample room
    console.log('🎓 Creating sample quiz room...');
    const sampleRoom = await db.createRoom({
      code: 'DEMO01',
      name: 'Demo Geography Quiz',
      teacherId: 'teacher_demo',
      status: 'waiting',
      questions: sampleQuestions.slice(0, 2).map(q => ({
        id: q._id || 'q' + Math.random(),
        text: q.text,
        options: q.options,
        category: q.category
      }))
    });
    console.log(`✅ Sample room created: ${sampleRoom.code}\n`);

    // Create sample students
    console.log('👨‍🎓 Creating sample students...');
    const students = [];
    const studentNames = ['Raj Kumar', 'Priya Singh', 'Amit Patel', 'Sneha Gupta'];
    
    for (const name of studentNames) {
      const student = await db.createStudent({
        name: name,
        roomCode: 'DEMO01',
        skillLevel: 'beginner'
      });
      students.push(student);
    }
    console.log(`✅ Created ${students.length} sample students\n`);

    // Record sample answers
    console.log('📝 Recording sample answers...');
    let answerCount = 0;
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      for (let j = 0; j < sampleQuestions.length; j++) {
        const question = sampleQuestions[j];
        const correct = Math.random() > 0.3; // 70% correct
        
        await db.recordAnswer({
          studentId: student._id || student.id,
          roomCode: 'DEMO01',
          questionId: question._id || 'q' + j,
          selected: Math.floor(Math.random() * 4),
          correct: correct,
          timeSpent: Math.floor(Math.random() * 30) + 5, // 5-35 seconds
          category: question.category
        });
        answerCount++;
      }
    }
    console.log(`✅ Recorded ${answerCount} sample answers\n`);

    // Create quiz session
    console.log('📊 Creating sample quiz session...');
    const session = await db.createSession({
      roomCode: 'DEMO01',
      teacherId: 'teacher_demo',
      startTime: new Date()
    });
    console.log(`✅ Quiz session created\n`);

    // Update leaderboard
    console.log('🏆 Updating leaderboard...');
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const score = Math.floor(Math.random() * 40) + 60; // 60-100
      
      await db.updateLeaderboard('DEMO01', {
        studentId: student._id || student.id,
        studentName: student.name,
        score: score
      });
    }
    console.log('✅ Leaderboard updated\n');

    // Health check
    console.log('🏥 Checking database health...');
    const health = await db.healthCheck();
    console.log(`✅ Database health: ${JSON.stringify(health)}\n`);

    console.log('✨ Database initialization complete!\n');
    console.log('📌 Sample Data Created:');
    console.log(`   - Room Code: DEMO01`);
    console.log(`   - Questions: ${sampleQuestions.length}`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Answers: ${answerCount}`);
    console.log('\n🧪 Test the application:');
    console.log('   1. Start server: npm run dev');
    console.log('   2. Visit: http://localhost:3000');
    console.log('   3. Use room code: DEMO01');
    console.log('   4. Join as player with any name\n');

  } catch (error) {
    console.error('❌ Error during initialization:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Disconnect from MongoDB
    await disconnectDB();
    await db.cleanup();
    process.exit(0);
  }
}

// Run initialization
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
