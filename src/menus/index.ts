import { botInfoMenu } from "./botInfo.js";
import { blackjackMenu } from "./cassino/blackjack.js";
import { commandsMenu } from "./commandsMenu.js";
import { devDashboardMenu } from "./dev/dashboard.js";
import { addQuestionMenu } from "./dev/tryvia/addQuestion.js";
import { editQuestionMenu } from "./dev/tryvia/editQuestion.js";
import { fetchAllPendingQuestionsMenu } from "./dev/tryvia/fetchAllPendingQuestions.js";
import { fetchAllQuestionsMenu } from "./dev/tryvia/fetchAllQuestions.js";
import { stockInfoMenu } from "./investment/stockInfo.js";
import { stocksMenu } from "./investment/stocks.js";
import { userStocksMenu } from "./investment/userStocks.js";
import { avaibleJobsMenu } from "./jobs/avaibleJobs.js";
import { interviewMenu } from "./jobs/interview.js";
import { rankingMenu } from "./leaderboard/ranking.js";
import { startRankingMenu } from "./leaderboard/startRanking.js";
import { ignoreTagMenu } from "./mail/ignoreTag.js";
import { userMailsMenu } from "./mail/userMails.js";
import { dashboardMenu } from "./settings/dashboard.js";
import { questionMenu } from "./tryviaGame/question.js";
import { userLogsMenu } from "./userLogs.js";
import { rankMenu } from "./xpSystem/rank.js";

export const menus = {
    commands: commandsMenu,
    logsMenu: userLogsMenu,
    jobs: {
        avaibleJobs: avaibleJobsMenu,
        interview: interviewMenu
    },
    investment: {
        userStocks: userStocksMenu,
        stocks: stocksMenu,
        stockInfoMenu: stockInfoMenu
    },
    settings: {
        dashboard: dashboardMenu
    },
    mails: {
        userMails: userMailsMenu,
        ignoreTags: ignoreTagMenu
    },
    botinfo: botInfoMenu,
    cassino: {
        blackjack: blackjackMenu,
    },
    xpSystem: {
        rank: rankMenu
    },
    dev: {
        dashboard: devDashboardMenu,
        tryvia: {
            fetchAllQuestions: fetchAllQuestionsMenu,
            fetchAllPendingQuestions: fetchAllPendingQuestionsMenu,
            addQuestion: addQuestionMenu,
            editQuestion: editQuestionMenu
        }
    },
    tryviaGame: {
        question: questionMenu
    },
    leaderboard: {
        startRanking: startRankingMenu,
        ranking: rankingMenu
    }
}