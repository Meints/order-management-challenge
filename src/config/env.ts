type Env = {
    PORT: number;
    MONGO_URI: string;
    JWT_SECRET: string;
}

function getEnv(): Env {
    const { PORT, MONGO_URI, JWT_SECRET } = process.env;

    if (!MONGO_URI) {
        throw new Error('MONGO_URI is not defined');
    }

    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }

    return {
        PORT: PORT ? parseInt(PORT) : 3000,
        MONGO_URI,
        JWT_SECRET,
    }
}

export const env = getEnv();