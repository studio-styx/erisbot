import { redis } from "#database";
import NodeCache from "node-cache";

const cache = new NodeCache();

export interface InterviewQuestion {
  question: string;
  answer?: string;
}

export async function getInterviewQuestions(userId: string, companyId: string): Promise<InterviewQuestion[] | null> {
  const key = `interview:${userId}:${companyId}`
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error getting interview questions:', error);
    return null;
  }
}

export async function setInterviewQuestions(userId: string, companyId: string, questions: InterviewQuestion[]): Promise<void> {
  const key = `interview:${userId}:${companyId}`
  const raw = JSON.stringify(questions);
  await redis.setex(key, 60 * 20, raw);
}

export async function updateInterviewAnswer(userId: string, companyId: string, page: number, answer: string): Promise<void> {
  const key = `interview:${userId}:${companyId}`
  const raw = await redis.get(key) || "[]";
  const questions = JSON.parse(raw) as InterviewQuestion[];
  if (questions && questions[page]) {
    questions[page].answer = answer;
    await redis.setex(key, 60 * 20, JSON.stringify(questions));
  }
}

export async function clearInterviewQuestions(userId: string, companyId: string): Promise<void> {
  const key = `interview:${userId}:${companyId}`
  await redis.del(key);
}

export async function setInterviewCooldown(userId: string) {
  const key = `interview:cooldown:${userId}`;
  const endTime = Date.now() + (60 * 20 * 1000); // 20 minutos a partir de agora
  await redis.setex(key, 60 * 20, endTime.toString());
}

export async function getInterviewCooldown(userId: string): Promise<number | undefined> {
  const key = `interview:cooldown:${userId}`;
  const raw = await redis.get(key);
  if (!raw) return undefined;
  
  const endTime = Number(raw);
  const remaining = endTime - Date.now();
  
  // Se for um valor muito antigo (dados corrompidos), limpar
  if (remaining > 60 * 60 * 1000 * 24 * 365) { // Mais de 1 ano
    await redis.del(key);
    return undefined;
  }
  
  return Math.max(0, remaining); // Retorna tempo restante em milissegundos
}

export async function removeInterviewCooldown(userId: string) {
  const key = `interview:cooldown:${userId}`;
  await redis.del(key);
}

// geral

export function getCache(name: string): any {
  return cache.get(name)
}

export function setCache(name: string, value: any): void {
  cache.set(name, value);
}

export function clearCache(name: string): void {
  cache.del(name);
}