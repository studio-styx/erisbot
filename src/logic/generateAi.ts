import { gemini } from "#tools";

interface QueueItem {
    prompt: string;
    resolve: (value: { success: boolean; text?: string; error?: any }) => void;
    reject: (reason: any) => void;
}

class GeminiQueue {
    private queue: QueueItem[] = [];
    private activeRequests: number = 0;
    private readonly maxConcurrent: number = 3;

    constructor() { }

    // Adiciona um prompt à fila
    async enqueue(prompt: string): Promise<{ success: boolean; text?: string; error?: any }> {
        return new Promise((resolve, reject) => {
            this.queue.push({ prompt, resolve, reject });
            this.processQueue();
        });
    }

    // Processa a próxima requisição na fila
    private async processQueue() {
        if (this.activeRequests >= this.maxConcurrent || this.queue.length === 0) {
            return;
        }

        this.activeRequests++;
        const item = this.queue.shift()!;

        try {
            const { response } = await gemini.text.generateContent(item.prompt);
            const result = gemini.getText(response);

            item.resolve(result);
        } catch (error) {
            item.resolve({ success: false, error });
        } finally {
            this.activeRequests--;
            this.processQueue(); // Processa o próximo item
        }
    }
}

const geminiQueue = new GeminiQueue();

export async function generateGeminiContent(
    prompt: string
): Promise<{ success: boolean; text?: string; error?: any }> {
    return geminiQueue.enqueue(prompt);
}