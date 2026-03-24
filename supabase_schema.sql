-- Run this in the Supabase SQL Editor to initialize your Game Database

CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    status TEXT DEFAULT 'waiting',
    max_players INT DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    room_code TEXT NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    accuracy FLOAT DEFAULT 0,
    skill_level TEXT DEFAULT 'beginner',
    total_questions_answered INT DEFAULT 0,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_room FOREIGN KEY (room_code) REFERENCES rooms(code) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS answer_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    room_code TEXT NOT NULL,
    question_id TEXT NOT NULL,
    selected TEXT NOT NULL,
    correct BOOLEAN NOT NULL,
    time_spent INT NOT NULL,
    category TEXT DEFAULT 'general',
    difficulty INT DEFAULT 1,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_room FOREIGN KEY (room_code) REFERENCES rooms(code) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    total_questions INT NOT NULL,
    total_students INT DEFAULT 0,
    avg_score FLOAT DEFAULT 0,
    CONSTRAINT fk_room FOREIGN KEY (room_code) REFERENCES rooms(code) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS performances (
    student_id TEXT PRIMARY KEY,
    overall_accuracy FLOAT DEFAULT 0,
    total_answered INT DEFAULT 0,
    correct_answers INT DEFAULT 0,
    learning_curve TEXT DEFAULT 'stable',
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS difficulty_progressions (
    student_id TEXT PRIMARY KEY,
    current_level INT DEFAULT 1,
    previous_level INT DEFAULT 1,
    attempts_since_adjustment INT DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INT NOT NULL,
    category TEXT DEFAULT 'general',
    difficulty INT DEFAULT 1,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: RLS (Row Level Security) is ignored here as the Express backend connects securely with a Service Key
