// MongoDB Initialization Script
// This script runs automatically when the MongoDB container starts for the first time
// It creates the database and sets up initial collections
//
// Note: This file is mounted as a read-only volume in docker-compose.yml
// Location in container: /docker-entrypoint-initdb.d/mongo-init.js

// Switch to the application database
db = db.getSiblingDB('team-flags-edu');

// Create collections with schema validation
db.createCollection('students', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Student name is required',
        },
        email: {
          bsonType: 'string',
          pattern: '^.+@.+$',
          description: 'Valid email is required',
        },
        team: {
          bsonType: 'string',
          description: 'Team assignment',
        },
        location: {
          bsonType: 'string',
          enum: ['Malmö', 'Jönköping', 'Remote'],
          description: 'Campus location',
        },
        createdAt: {
          bsonType: 'date',
          description: 'Record creation timestamp',
        },
      },
    },
  },
});

db.createCollection('teams', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Team name is required',
        },
        score: {
          bsonType: 'int',
          minimum: 0,
          description: 'Team score',
        },
        location: {
          bsonType: 'string',
          description: 'Team location',
        },
      },
    },
  },
});

db.createCollection('users');

// Create indexes for better query performance
db.students.createIndex({ email: 1 }, { unique: true });
db.students.createIndex({ team: 1 });
db.teams.createIndex({ name: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });

print('✅ MongoDB initialization complete!');
print('📚 Collections created: students, teams, users');
print('🔍 Indexes created for email and team fields');
