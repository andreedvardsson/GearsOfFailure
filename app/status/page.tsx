import ConfigStatus from '../components/ConfigStatus';

export default function StatusPage() {
  // Check if environment variables are configured
  const firebaseConfigured = !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );

  const mongoUri = process.env.MONGODB_URI || '';
  const mongoConfigured = !!(
    mongoUri &&
    mongoUri !== 'mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority' &&
    mongoUri !== ''
  );

  // Detect Docker Compose mode by checking if MONGODB_URI uses the 'db' service name
  // or if we have the compose-specific environment
  const dockerComposeMode = mongoUri.includes('@db:') || mongoUri.includes('://db:');

  // Nginx is running if we're in Docker Compose mode (it's part of the stack)
  const nginxConfigured = dockerComposeMode;

  return (
    <ConfigStatus
      firebaseConfigured={firebaseConfigured}
      mongoConfigured={mongoConfigured}
      dockerComposeMode={dockerComposeMode}
      nginxConfigured={nginxConfigured}
    />
  );
}
