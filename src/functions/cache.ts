import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hora de TTL

export interface InterviewQuestion {
  question: string;
  answer?: string;
}

export function getInterviewQuestions(userId: string, companyId: string): InterviewQuestion[] | undefined {
  return cache.get(`${userId}:${companyId}`);
}

export function setInterviewQuestions(userId: string, companyId: string, questions: InterviewQuestion[]): void {
  cache.set(`${userId}:${companyId}`, questions);
}

export function updateInterviewAnswer(userId: string, companyId: string, page: number, answer: string): void {
  const questions = cache.get<InterviewQuestion[]>(`${userId}:${companyId}`);
  if (questions && questions[page]) {
    questions[page].answer = answer;
    cache.set(`${userId}:${companyId}`, questions);
  }
}

export function clearInterviewQuestions(userId: string, companyId: string): void {
  cache.del(`${userId}:${companyId}`);
}