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

export interface TriviaAPIItemResponse {
    category: string;
    id: string;
    correctAnswer: string;
    incorrectAnswers: string[]
    question: {
      text: string;
    };
    tags: string[];
    type: "text_choice";
    difficulty: "easy" | "medium" | "hard";
    regions: [];
    isNiche: boolean;
}[]