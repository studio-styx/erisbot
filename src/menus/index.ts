import { commandsMenu } from "./commandsMenu.js";
import { stockInfoMenu } from "./investment/stockInfo.js";
import { stocksMenu } from "./investment/stocks.js";
import { userStocksMenu } from "./investment/userStocks.js";
import { avaibleJobsMenu } from "./jobs/avaibleJobs.js";
import { interviewMenu } from "./jobs/interview.js";
import { ignoreTagMenu } from "./mail/ignoreTag.js";
import { userMailsMenu } from "./mail/userMails.js";
import { dashboardMenu } from "./settings/dashboard.js";
import { userLogsMenu } from "./userLogs.js";

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
    }
}