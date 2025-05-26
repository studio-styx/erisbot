import { commandsMenu } from "./commandsMenu.js";
import { stocksMenu } from "./investment/stocks.js";
import { userStocksMenu } from "./investment/userStocks.js";
import { avaibleJobsMenu } from "./jobs/avaibleJobs.js";
import { interviewMenu } from "./jobs/interview.js";
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
        stocks: stocksMenu
    }
}