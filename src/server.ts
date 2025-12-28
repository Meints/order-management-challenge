import 'dotenv/config';
import { env } from './config/env';
import { app } from './app';
import { connectDB } from './shared/database/mongo';

async function bootstrap() {
    await connectDB();

    app.listen(env.PORT, () => {
        console.log(`Server is running on port ${env.PORT}`);
    })
}

bootstrap();