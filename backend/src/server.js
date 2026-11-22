import app from './app.js';
import { env } from './config/environment.js';

app.listen(env.port, () => {
  console.log(`[Backend] Server berjalan di http://localhost:${env.port} (${env.nodeEnv})`);
});
