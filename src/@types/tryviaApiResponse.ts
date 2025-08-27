export interface TryviaApiResponseData {
    response_code: number;
    results: TryviaApiResponseResultsData[]
}

export interface TryviaApiResponseResultsData {
    type: "multiple" | "boolean";
    difficulty: "easy" | "medium" | "hard";
    category: string;
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
}