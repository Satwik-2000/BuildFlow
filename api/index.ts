import serverless from 'serverless-http';
import { createApp } from '../backend/src/index.js';

let serverlessHandler: any;

export default async function handler(req: any, res: any) {
    if (!serverlessHandler) {
        const { app } = await createApp();
        serverlessHandler = serverless(app);
    }
    return serverlessHandler(req, res);
}
