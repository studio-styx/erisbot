import { Store } from "#base";
import { prisma } from "#database";
import { icon, res, registerLog } from "#functions";
import { Prisma } from "#prisma/client";
import { ChatInputCommandInteraction, time } from "discord.js";

const trys = new Store<{ attempts: number; cooldown: Date }>();

export async function economyDailyCommand(interaction: ChatInputCommandInteraction<"cached">) {
    const id = interaction.user.id;

    const userTrys = trys.get(`${id}:daily`);
    if (userTrys) {
        if (userTrys.attempts === 1) {
            const messages = [
                `${icon.Eris_thinking} | Ei! eu acho que já te disse pra voltar ${time(userTrys.cooldown, "R")} não foi?`,
                `${icon.Eris_thinking} | Eu acho que já te disse pra voltar ${time(userTrys.cooldown, "R")} não foi?`,
                `${icon.denied} | Por favor volte novamente no horário que eu te disse anteriomente!`,
                `${icon.denied} | Eu já te disse pra voltar ${time(userTrys.cooldown, "R")}`,
                `${icon.Eris_thinking} | Calma lá! Você precisa esperar até ${time(userTrys.cooldown, "R")}`,
                `${icon.denied} | Paciência, jovem! Seu próximo daily só ${time(userTrys.cooldown, "R")}`,
                `${icon.Eris_thinking} | Hmm, parece que alguém está ansioso! Volte ${time(userTrys.cooldown, "R")}`,
                `${icon.denied} | O daily não cresce em árvore! Espere até ${time(userTrys.cooldown, "R")}`
            ]
            interaction.reply(res.danger(messages[Math.floor(Math.random() * messages.length)], { flags: [] }));
        } else if (userTrys.attempts === 2) {
            const messages = [
                `${icon.Eris_Angry} | Ei! de novo? eu acho que já te disse pra voltar ${time(userTrys.cooldown, "R")} não foi?`,
                `${icon.Eris_Angry} | Eu já te disse pra voltar ${time(userTrys.cooldown, "R")}`,
                `${icon.Eris_Angry} | Essa já é a segunda vez que eu disse pra voltar ${time(userTrys.cooldown, "R")}`,
                `${icon.Eris_Angry} | Essa já é a segunda vez! por favor volte ${time(userTrys.cooldown, "R")}`,
                `${icon.Eris_Angry} | Você tá me zoando? Segunda vez que aviso! Volte ${time(userTrys.cooldown, "R")}`,
                `${icon.Eris_Angry} | Tá achando que se insistir eu vou ceder? Volte ${time(userTrys.cooldown, "R")}`,
                `${icon.Eris_Angry} | Já cansei de repetir! Segunda vez que falo pra voltar ${time(userTrys.cooldown, "R")}`,
                `${icon.Eris_Angry} | Aff, de novo isso? Volte ${time(userTrys.cooldown, "R")} como eu já disse!`
            ]
            interaction.reply(res.danger(messages[Math.floor(Math.random() * messages.length)], { flags: [] }));
        } else if (userTrys.attempts === 3) {
            const messages = [
                `${icon.Eris_Angry} | Ei! você está me testando? já te disse pra voltar${time(userTrys.cooldown, "R")} três vezes!`,
                `${icon.Eris_Angry} | Eu já te disse pra voltar${time(userTrys.cooldown, "R")} três vezes!`,
                `${icon.Eris_Angry} | Essa já é a terceira vez que eu disse pra voltar${time(userTrys.cooldown, "R")}`,
                `${icon.Eris_Angry} | Já chega né? você não vai conseguir outro daily tão rápido assim, volte${time(userTrys.cooldown, "R")}`,
                `${icon.Eris_Angry} | Pela terceira vez: VOLTE ${time(userTrys.cooldown, "R")}!`,
                `${icon.Eris_Angry} | Tá achando que eu sou o Siri? Pare de me perguntar a mesma coisa!`,
                `${icon.Eris_Angry} | Já virou falta de educação! Terceira vez que aviso!`,
                `${icon.Eris_Angry} | Eu devo ter dito umas 300 vezes pra voltar ${time(userTrys.cooldown, "R")}`
            ]
            interaction.reply(res.danger(messages[Math.floor(Math.random() * messages.length)], { flags: [] }));
        } else if (userTrys.attempts === 4) {
            const messages = [
                `${icon.Eris_Angry} | Eu não vou repetir mais isso, por favor volte${time(userTrys.cooldown, "R")}`,
                `${icon.Eris_Angry} | Eu não vou repetir de novo.`,
                `${icon.Eris_Angry} | O objetivo era me irritar? ótimo! conseguiu, agora não volte mais novamente.`,
                `${icon.Eris_Angry} | Mas que coisa! pare com isso! não irei repetir isso!`,
                `${icon.Eris_Angry} | Você está me testando? não vou repetir isso!`,
                `${icon.Eris_Angry} | Já chega, não quero mais falar com você!`,
                `${icon.Eris_Angry} | Chega! Meu limite de paciência acabou!`,
                `${icon.Eris_Angry} | Pronto, cansei! Vou ignorar você até ${time(userTrys.cooldown, "R")}`,
                `${icon.Eris_Angry} | Isso já virou assédio! Pare imediatamente!`,
                `${icon.Eris_Angry} | Eu poderia te mutar por spam, sabia? Último aviso!`
            ]
            interaction.reply(res.danger(messages[Math.floor(Math.random() * messages.length)], { flags: [] }));
        } else {
            trys.set(`${id}:daily`, { attempts: userTrys.attempts + 1, cooldown: userTrys.cooldown }, { time: 1000 * 60 * 2 });
            return;
        }
        trys.set(`${id}:daily`, { attempts: userTrys.attempts + 1, cooldown: userTrys.cooldown }, { time: 1000 * 60 * 2 });
        return;
    }

    await interaction.deferReply();

    const now = new Date();

    const cooldownData = await prisma.cooldown.findFirst({
        where: { userId: id, name: "daily" },
        select: { willEndIn: true, id: true }
    });

    if (cooldownData?.willEndIn && cooldownData.willEndIn > now) {
        interaction.editReply(res.danger(`${icon.denied} | Você já pegou seu prêmio diário hoje. Tente novamente ${time(cooldownData.willEndIn, "R")}`));
        trys.set(`${id}:daily`, { attempts: 1, cooldown: cooldownData.willEndIn }, { time: 1000 * 60 * 2 });
        return;
    }

    const dailyValue = Math.floor(Math.random() * 51);

    const willEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (cooldownData?.id) {
        await prisma.cooldown.update({
            where: { id: cooldownData.id },
            data: { willEndIn: willEnd }
        });
    } else {
        await prisma.cooldown.create({
            data: { userId: id, name: "daily", willEndIn: willEnd }
        });
    }

    const newUser = await prisma.user.upsert({
        where: { id },
        create: { id },
        update: {
            money: { increment: new Prisma.Decimal(dailyValue) }
        }
    });

    interaction.editReply(res.fuchsia(`${icon.Eris_enchanted} | Parabéns! você pegou seu prêmio diário de **${dailyValue}** styx! agora você possui: **${newUser.money}** styx em sua carteira! ${icon.Eris_ok_left}`));

    await registerLog(
        `Recebeu o prêmio diário de **${dailyValue}** styx!`,
        "info",
        4,
        id
    );
    return;
}