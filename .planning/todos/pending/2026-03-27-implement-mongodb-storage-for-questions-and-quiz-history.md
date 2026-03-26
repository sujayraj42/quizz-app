---
created: 2026-03-27T01:11:44+05:30
title: Implement MongoDB storage for questions and quiz history
area: database
files: []
---

## Problem

Need to store questions locally and in the database. Currently, the local questions need a MongoDB function for unified storage, and the database needs 20 sample questions of varying difficulty. Additionally, we need to show the user's quiz history stored in MongoDB.

## Solution

1. TBD: Create MongoDB schema for `Questions` and `QuizHistory`.
2. Write seed script to populate 20 diverse sample questions.
3. Add or update API routes to fetch questions and store/retrieve quiz history from MongoDB.
