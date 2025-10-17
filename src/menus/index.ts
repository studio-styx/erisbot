import { botInfoMenu } from "./botInfo.js";
import { blackjackMenu } from "./cassino/blackjack.js";
import { blackjackMultiplayerMenu } from "./cassino/blackjackMultiplayer.js";
import { commandsMenu } from "./commandsMenu.js";
import { devDashboardMenu } from "./dev/dashboard.js";
import { addQuestionMenu } from "./dev/tryvia/addQuestion.js";
import { editQuestionMenu } from "./dev/tryvia/editQuestion.js";
import { fetchAllPendingQuestionsMenu } from "./dev/tryvia/fetchAllPendingQuestions.js";
import { fetchAllQuestionsMenu } from "./dev/tryvia/fetchAllQuestions.js";
import { giveawayEndMenu } from "./giveaway/giveawayEndMenu.js";
import { giveawayInterfaceMenu } from "./giveaway/giveawayInterface.js";
import { giveawayManageMenu } from "./giveaway/giveawayManage.js";
import { stockInfoMenu } from "./investment/stockInfo.js";
import { stocksMenu } from "./investment/stocks.js";
import { userStocksMenu } from "./investment/userStocks.js";
import { avaibleJobsMenu } from "./jobs/avaibleJobs.js";
import { interviewMenu } from "./jobs/interview.js";
import { rankingMenu } from "./leaderboard/ranking.js";
import { startRankingMenu } from "./leaderboard/startRanking.js";
import { userMailsMenu } from "./mail/userMails.js";
import { fishMenu } from "./minigames/fish.js";
import { adoptionCenterMenu } from "./pet/adoptionCenter.js";
import { petCareMenu } from "./pet/petCare.js";
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
    },
    botinfo: botInfoMenu,
    cassino: {
        blackjack: blackjackMenu,
        blackjackMultiplayer: blackjackMultiplayerMenu
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
    },
    giveaway: {
        giveawayEnd: giveawayEndMenu,
        giveawayManage: giveawayManageMenu,
        giveawayInterface: giveawayInterfaceMenu
    },
    minigames: {
        fishing: fishMenu,
    },
    pets: {
        adoptionCenter: adoptionCenterMenu,
        care: petCareMenu
    }
}