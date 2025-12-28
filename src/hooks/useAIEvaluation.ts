import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import browserImageCompression from 'browser-image-compression';

export interface AIEvaluationResult {
    carDetails: {
        make: string;
        model: string;
        year: string;
        color: string;
        condition: string;
    };
    marketAnalysis: {
        isFairPrice: boolean;
        priceDeviation: string;
        advice: string;
    };
    timestamp: string;
}

export type AIState = 'idle' | 'uploading' | 'scanning' | 'thinking' | 'complete' | 'error';

export const useAIEvaluation = () => {
    const [state, setState] = useState<AIState>('idle');
    const [result, setResult] = useState<AIEvaluationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (message: string) => {
        setLogs(prev => [...prev, message]);
    };

    const evaluateCarImage = async (file: File, price: number) => {
        setState('uploading');
        setError(null);
        setLogs([]);
        addLog('Initiating secure connection...');

        try {
            // 1. Compress Image (Client-side optimization)
            addLog('Compressing image for neural upload...');
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1024,
                useWebWorker: true
            };

            const compressedFile = await browserImageCompression(file, options);

            // 2. Convert to Base64
            setState('scanning');
            addLog('Engaging Gemini Vision Processor...');
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(compressedFile);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });

            // Remove header (data:image/jpeg;base64,)
            const base64Data = base64.split(',')[1];

            // 3. Call Cloud Function
            setState('thinking');
            addLog('Vision Analysis Complete.');
            addLog('Requesting Market Logic from DeepSeek Node...');

            const functions = getFunctions(getApp(), 'europe-west1');
            const evaluateCar = httpsCallable(functions, 'evaluateCar');

            const response = await evaluateCar({
                imageBase64: base64Data,
                price: price,
                marketAvg: 0 // Optional: let the server handle or pass if known
            });

            const data = response.data as AIEvaluationResult;

            setResult(data);
            setState('complete');
            addLog('Analysis Finalized. Rendering Hologram...');

        } catch (err: any) {
            console.error('AI Evaluation Failed:', err);
            setError(err.message || 'Neural Link Disconnected');
            setState('error');
            addLog('CRITICAL FAILURE: Connection Lost.');
        }
    };

    const reset = () => {
        setState('idle');
        setResult(null);
        setError(null);
        setLogs([]);
    };

    return {
        state,
        result,
        error,
        logs,
        evaluateCarImage,
        reset
    };
};
