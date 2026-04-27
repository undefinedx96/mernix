import type { Config } from '../types/types.ts';

const conf: Config = {
    baseUrl: String(import.meta.env.VITE_SERVER_URL)
};

export default conf;