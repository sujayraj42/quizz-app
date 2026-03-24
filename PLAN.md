# Study-Buddy Real-Time Quiz Room

## 1. Project Goal

Build a simple but competition-ready Node.js web app where:

- A teacher creates a quiz room
- Students join with a room code
- The teacher starts the quiz
- The server pushes each question to all students at the same time using Socket.io
- Students answer before the timer ends
- Scores and leaderboard update instantly

This should be optimized for a live classroom demo: fast setup, visually impressive UI, and clear real-time behavior.

## 2. Core Pitch

**One-line pitch:**  
A real-time competitive quiz platform where one host controls the game and every student receives questions simultaneously, creating a fair, exciting live challenge.

**Key technical explanation for judges/class:**  
Traditional websites wait for users to refresh or click again to see new content. With WebSockets via Socket.io, the server keeps an open connection to every browser, so it can broadcast the next question, timer state, answer reveal, and leaderboard changes instantly to everyone at once.

## 3. Demo Scope

Keep the first version intentionally small and reliable.

### Must-have

- Host creates room
- Students join room with name
- Real-time lobby with participant list
- Host starts quiz
- Server sends questions one-by-one to all clients
- Countdown timer per question
- Students submit one answer
- Auto-lock answers when timer ends
- Instant leaderboard after each round
- Final winner screen

### Nice-to-have for competition

- Animated transitions between lobby, question, and leaderboard
- Podium-style top 3 winner view
- Join sound / correct answer celebration
- Avatar color chips or profile badges
- "Fastest correct answer" bonus points
- Mobile-friendly student screen

### Skip in version 1

- Authentication
- Database
- Multiple teachers per room
- Complex admin dashboards
- Question authoring UI
- Payments or accounts

## 4. Suggested Tech Stack

### Backend

- Node.js
- Express
- Socket.io

### Frontend

- EJS templates with vanilla JS for simplicity, or React if the team already works faster with it
- Tailwind CSS for fast, polished UI composition
- Framer Motion only if React is used

### Data storage

- In-memory JavaScript objects for rooms, players, questions, scores
- Optional local JSON seed file for quiz questions

For a class demo, in-memory state is the correct tradeoff because it reduces setup and failure points.

## 5. Architecture

### Client roles

- Host screen: create room, control quiz, monitor players
- Student screen: join room, answer questions, see rank
- Shared display screen: optional big-screen leaderboard for presentation

### Server responsibilities

- Create and manage quiz rooms
- Track connected sockets
- Store player state and scores
- Broadcast question events
- Accept answer submissions
- Calculate scores
- Push leaderboard updates

### Real-time flow

1. Host creates room
2. Server generates room code
3. Students join room via socket event
4. Host clicks "Start Quiz"
5. Server emits `quiz:question` to that room
6. Students emit `quiz:answer`
7. Timer ends on server
8. Server grades answers and updates points
9. Server emits `quiz:leaderboard`
10. Server emits next question
11. Server emits `quiz:final`

## 6. Event Design

Use a small, explicit event contract.

### Client -> Server

- `room:create`
- `room:join`
- `quiz:start`
- `quiz:answer`
- `quiz:next`

### Server -> Client

- `room:created`
- `room:joined`
- `room:update`
- `quiz:question`
- `quiz:timer`
- `quiz:answerResult`
- `quiz:leaderboard`
- `quiz:final`
- `app:error`

## 7. Scoring Logic

Simple scoring is best for demo clarity.

- Correct answer: +100 points
- Speed bonus: up to +50 based on time left
- Wrong answer: +0
- No answer: +0

Formula example:

`score = 100 + remainingSeconds * 5`

This makes the live leaderboard more dynamic and visually exciting.

## 8. UI Direction

The UI should feel more like an esports quiz stage than a school form.

### Visual theme

- Dark navy to electric cyan gradient background
- Glassmorphism cards with subtle neon borders
- Large countdown ring and oversized answer buttons
- Bold condensed heading font plus clean readable body font
- Animated rank movement in leaderboard

### Key screens

- Landing page
- Host create room page
- Student join page
- Lobby
- Live question screen
- Round results / leaderboard
- Final podium screen

### UI components to design

- Hero panel with animated room code
- Lobby player cards
- Countdown timer ring
- Answer choice tiles
- Live leaderboard rail
- Top 3 podium component
- Toast notifications
- Quiz progress bar

## 9. "Prize-Winning" UI Execution Notes

If this is for competition, polish matters more than feature count.

- Use one strong visual concept consistently instead of mixing styles
- Prioritize spacing, typography, and motion over adding more widgets
- Make the room code visually dominant for demo usability
- Animate score changes and rank swaps
- Use color intentionally:
  - cyan/blue for active
  - green for correct
  - red/orange for incorrect
  - gold/silver/bronze for podium

## 10. Recommended Folder Structure

```text
study-buddy/
  server/
    index.js
    socket.js
    roomManager.js
    quizEngine.js
    questions.js
  public/
    css/
      styles.css
    js/
      host.js
      student.js
      shared.js
  views/
    index.ejs
    host.ejs
    join.ejs
    room.ejs
    quiz.ejs
    final.ejs
  package.json
  PLAN.md
```

## 11. Build Plan

### Phase 1: Foundation

- Initialize Node.js project
- Install Express and Socket.io
- Set up server entry point
- Serve static assets and pages
- Add simple route structure

### Phase 2: Room System

- Build room creation logic
- Generate short room codes
- Allow students to join by code
- Show real-time lobby updates

### Phase 3: Quiz Engine

- Load question set from JSON or JS file
- Start quiz from host screen
- Broadcast questions to all students
- Add server-side timer
- Accept and store answers

### Phase 4: Scoring and Leaderboard

- Grade answers on server
- Compute speed bonus
- Sort leaderboard after each round
- Broadcast live score updates

### Phase 5: Competition UI

- Apply strong visual identity
- Build animated timer and answer cards
- Add leaderboard transitions
- Add final winner podium

### Phase 6: Demo Hardening

- Handle duplicate names
- Handle disconnect/reconnect gracefully
- Prevent multiple answers per round
- Add fallback error messages
- Test on laptop + mobile simultaneously

## 12. Demo Script

Use this exact story in class.

1. Open host page and create a room
2. Show generated room code on projector
3. Join from 2-3 student devices
4. Show lobby updating instantly
5. Explain that Socket.io keeps every client connected live
6. Start quiz and show question appearing at the same time everywhere
7. Submit different answers from different devices
8. Let timer end
9. Show leaderboard reorder instantly
10. Finish with final podium screen

## 13. What to Say During Presentation

### Problem

Classroom quizzes are often static, slow, and not engaging.

### Solution

Study-Buddy turns quizzes into a synchronized live competition.

### Technical highlight

WebSockets let the server push state changes instantly instead of waiting for manual refreshes.

### Why it stands out

- Real-time multiplayer experience
- Fair simultaneous question delivery
- Instant leaderboard excitement
- Strong presentation-ready UI

## 14. Timeline

### Day 1

- Project setup
- Room join/create flow
- Lobby sync

### Day 2

- Question push logic
- Timer
- Answer handling

### Day 3

- Leaderboard
- Final winner screen
- UI polish

### Day 4

- Bug fixes
- Demo rehearsal
- Performance and mobile check

## 15. Success Criteria

The project is ready when:

- 1 host and 3+ students can join the same room
- Questions appear simultaneously for all players
- Scores update instantly without refresh
- The interface looks polished enough for a competition demo
- The full quiz can be completed in under 3 minutes live

## 16. Best MVP Decision

If time is limited, build this exact MVP:

- Express + Socket.io server
- In-memory room state
- 5 hardcoded questions
- 1 host screen
- 1 student screen
- 1 animated leaderboard

That version is small, stable, and still impressive in front of judges.
