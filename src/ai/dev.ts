import { config } from 'dotenv';
config();

import '@/ai/flows/predict-request-urgency.ts';
import '@/ai/flows/detect-duplicate-requests.ts';