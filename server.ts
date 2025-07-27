import app from './app';
import { connectDatabase } from './shared/config/database';
import { logger } from './shared/utils/logger';

const PORT = process.env.PORT || 3000;

async function startServer(): Promise<void> {
  try {
    // Connect to MongoDB
    await connectDatabase();
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();