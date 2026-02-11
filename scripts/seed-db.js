/**
 * MongoDB Seed Script
 * Team Flags EDU - Week 3 Docker Compose Lab
 *
 * This script populates the database with demo data for testing.
 *
 * Usage (from project root):
 *   # With Docker Compose running:
 *   docker compose exec db mongosh team-flags-edu /scripts/seed-db.js
 *
 *   # Or copy and run:
 *   docker compose cp scripts/seed-db.js db:/tmp/seed-db.js
 *   docker compose exec db mongosh team-flags-edu /tmp/seed-db.js
 */

// Clear existing data (optional - comment out to keep existing)
db.students.deleteMany({});
db.teams.deleteMany({});

print('🌱 Seeding database with demo data...');

// Demo Teams
const teams = [
  {
    name: 'The Docker Dolphins',
    score: 850,
    location: 'Malmö',
    achievements: ['First Container', 'Multi-Stage Master'],
    createdAt: new Date(),
  },
  {
    name: 'Container Crew',
    score: 720,
    location: 'Jönköping',
    achievements: ['Health Check Hero'],
    createdAt: new Date(),
  },
  {
    name: 'Kubernetes Knights',
    score: 680,
    location: 'Malmö',
    achievements: ['Network Navigator'],
    createdAt: new Date(),
  },
  {
    name: 'DevOps Dragons',
    score: 590,
    location: 'Jönköping',
    achievements: [],
    createdAt: new Date(),
  },
];

db.teams.insertMany(teams);
print(`✅ Inserted ${teams.length} teams`);

// Demo Students
const students = [
  // The Docker Dolphins
  {
    name: 'Alice Andersson',
    email: 'alice@example.com',
    team: 'The Docker Dolphins',
    location: 'Malmö',
    createdAt: new Date(),
  },
  {
    name: 'Bob Bergström',
    email: 'bob@example.com',
    team: 'The Docker Dolphins',
    location: 'Malmö',
    createdAt: new Date(),
  },
  {
    name: 'Charlie Chen',
    email: 'charlie@example.com',
    team: 'The Docker Dolphins',
    location: 'Malmö',
    createdAt: new Date(),
  },

  // Container Crew
  {
    name: 'Diana Dahl',
    email: 'diana@example.com',
    team: 'Container Crew',
    location: 'Jönköping',
    createdAt: new Date(),
  },
  {
    name: 'Erik Eriksson',
    email: 'erik@example.com',
    team: 'Container Crew',
    location: 'Jönköping',
    createdAt: new Date(),
  },
  {
    name: 'Fiona Franzén',
    email: 'fiona@example.com',
    team: 'Container Crew',
    location: 'Jönköping',
    createdAt: new Date(),
  },

  // Kubernetes Knights
  {
    name: 'Gustav Grahn',
    email: 'gustav@example.com',
    team: 'Kubernetes Knights',
    location: 'Malmö',
    createdAt: new Date(),
  },
  {
    name: 'Hanna Holm',
    email: 'hanna@example.com',
    team: 'Kubernetes Knights',
    location: 'Malmö',
    createdAt: new Date(),
  },
  {
    name: 'Ivan Isaksson',
    email: 'ivan@example.com',
    team: 'Kubernetes Knights',
    location: 'Malmö',
    createdAt: new Date(),
  },

  // DevOps Dragons
  {
    name: 'Julia Jonsson',
    email: 'julia@example.com',
    team: 'DevOps Dragons',
    location: 'Jönköping',
    createdAt: new Date(),
  },
  {
    name: 'Karl Karlsson',
    email: 'karl@example.com',
    team: 'DevOps Dragons',
    location: 'Jönköping',
    createdAt: new Date(),
  },
  {
    name: 'Lisa Lindqvist',
    email: 'lisa@example.com',
    team: 'DevOps Dragons',
    location: 'Jönköping',
    createdAt: new Date(),
  },
];

db.students.insertMany(students);
print(`✅ Inserted ${students.length} students`);

// Verify data
print('\n📊 Database Summary:');
print(`   Teams:    ${db.teams.countDocuments()}`);
print(`   Students: ${db.students.countDocuments()}`);

print('\n🎉 Seed complete! Your database is ready for testing.');
print('   Open http://localhost in your browser to see the data.');
