import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './db.js';
import User from './models/User.js';
import Event from './models/Event.js';
import Post from './models/Post.js';

export async function seedDatabase(keepConnected = false) {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    // Clear existing records
    await Post.deleteMany({});
    await Event.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing collections (User, Event, Post).');

    // 1. Create test users with different semesters
    const users = await User.insertMany([
      {
        name: 'Alex Rivera',
        collegeEmail: 'alex.rivera@campus.edu',
        semester: 'Sem 4',
      },
      {
        name: 'Priya Sharma',
        collegeEmail: 'priya.sharma@campus.edu',
        semester: 'Sem 6',
      },
      {
        name: 'Jordan Lee',
        collegeEmail: 'jordan.lee@campus.edu',
        semester: 'Sem 2',
      },
    ]);

    console.log(`Created ${users.length} test users.`);
    const [alex, priya, jordan] = users;

    // 2. Create dummy upcoming events with distinct semester eligibilities
    const events = await Event.insertMany([
      {
        eventName: 'HackPulse 2026: AI & Web3 Sprint',
        organizingClub: 'ACM Student Chapter',
        eligibleSemesters: ['Sem 4', 'Sem 6', 'Sem 8'],
        deadlineDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // in 7 days
        points: 150,
      },
      {
        eventName: 'CodeClash: Junior Dev Ideathon',
        organizingClub: 'IEEE Computer Society',
        eligibleSemesters: ['Sem 2', 'Sem 4'],
        deadlineDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // in 14 days
        points: 100,
      },
      {
        eventName: 'Senior Capstone Hack: Cloud & DevOps',
        organizingClub: 'Developer Student Club',
        eligibleSemesters: ['Sem 6', 'Sem 8'], // Excludes Sem 4!
        deadlineDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // in 10 days
        points: 200,
      },
      {
        eventName: 'Campus Algorithm Marathon',
        organizingClub: 'Competitive Programming Cell',
        eligibleSemesters: ['Sem 2', 'Sem 4'], // Excludes Sem 6!
        deadlineDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // in 4 days
        points: 80,
      },
    ]);

    console.log(`Created ${events.length} upcoming events.`);
    const [hackPulse, codeClash, capstoneHack, algoMarathon] = events;

    // 3. Create matchmaking posts linking users and events
    const posts = await Post.insertMany([
      {
        posterId: priya._id, // Priya (Sem 6)
        eventId: hackPulse._id, // Eligible: Sem 4, Sem 6, Sem 8
        isSpecificRoleNeeded: true,
        requestedSkills: 'React, Tailwind, Node.js API, Prompt Engineering',
      },
      {
        posterId: alex._id, // Alex (Sem 4)
        eventId: codeClash._id, // Eligible: Sem 2, Sem 4
        isSpecificRoleNeeded: true,
        requestedSkills: 'Full-stack MERN, UI/UX prototyping with Figma',
      },
      {
        posterId: priya._id, // Priya (Sem 6)
        eventId: capstoneHack._id, // Eligible: Sem 6, Sem 8 (Hidden for Sem 4)
        isSpecificRoleNeeded: true,
        requestedSkills: 'Docker, Kubernetes, AWS Terraform, Microservices architecture',
      },
      {
        posterId: alex._id, // Alex (Sem 4)
        eventId: algoMarathon._id, // Eligible: Sem 2, Sem 4 (Hidden for Sem 6)
        isSpecificRoleNeeded: false,
        requestedSkills: 'C++, Dynamic Programming, Graph Theory',
      },
    ]);

    console.log(`Created ${posts.length} matchmaking posts.`);
    console.log('\n--- Seed Verification ---');
    console.log('Sem 4 User (Alex Rivera) will receive: 3 posts (HackPulse, CodeClash, Campus Algo Marathon)');
    console.log('Sem 6 User (Priya Sharma) will receive: 2 posts (HackPulse, Senior Capstone Hack)');
    console.log('-------------------------\n');

    if (!keepConnected) {
      await disconnectDB();
      console.log('Database disconnected successfully.');
    }

    return { users, events, posts };
  } catch (error) {
    console.error('Error seeding database:', error);
    if (!keepConnected) {
      process.exit(1);
    }
    throw error;
  }
}

// Execute directly if run via `node seed.js`
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase(false);
}
