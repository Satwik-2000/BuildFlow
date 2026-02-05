import serverless from 'serverless-http';
import { createApp } from '../backend/dist/index.js';

let serverlessHandler: any;

export default async function handler(req: any, res: any) {
    try {
        if (!serverlessHandler) {
            const { app } = await createApp();
            serverlessHandler = serverless(app);
        }
        return serverlessHandler(req, res);
    } catch (error) {
        console.error('Handler error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: String(error) });
    }
}
