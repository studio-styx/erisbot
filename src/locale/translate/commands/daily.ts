import { icon } from "#functions"
import { User } from "#prisma"
import { time } from "discord.js"

export default {
    ptbr: {
        manyAttempts: (attempt: number, cooldown: Date) => {
            switch (attempt) {
                case 1: return [
                    `${icon.Eris_thinking} | Ei! eu acho que já te disse pra voltar ${time(cooldown, "R")} não foi?`,
                    `${icon.Eris_thinking} | Eu acho que já te disse pra voltar ${time(cooldown, "R")} não foi?`,
                    `${icon.denied} | Por favor volte novamente no horário que eu te disse anteriomente!`,
                    `${icon.denied} | Eu já te disse pra voltar ${time(cooldown, "R")}`,
                    `${icon.Eris_thinking} | Calma lá! Você precisa esperar até ${time(cooldown, "R")}`,
                    `${icon.denied} | Paciência, jovem! Seu próximo daily só ${time(cooldown, "R")}`,
                    `${icon.Eris_thinking} | Hmm, parece que alguém está ansioso! Volte ${time(cooldown, "R")}`,
                    `${icon.denied} | O daily não cresce em árvore! Espere até ${time(cooldown, "R")}`
                ]
                case 2: return [
                    `${icon.Eris_Angry} | Ei! de novo? eu acho que já te disse pra voltar ${time(cooldown, "R")} não foi?`,
                    `${icon.Eris_Angry} | Eu já te disse pra voltar ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | Essa já é a segunda vez que eu disse pra voltar ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | Essa já é a segunda vez! por favor volte ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | Você tá me zoando? Segunda vez que aviso! Volte ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | Tá achando que se insistir eu vou ceder? Volte ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | Já cansei de repetir! Segunda vez que falo pra voltar ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | Aff, de novo isso? Volte ${time(cooldown, "R")} como eu já disse!`
                ]
                case 3: return [
                    `${icon.Eris_Angry} | Ei! você está me testando? já te disse pra voltar${time(cooldown, "R")} três vezes!`,
                    `${icon.Eris_Angry} | Eu já te disse pra voltar${time(cooldown, "R")} três vezes!`,
                    `${icon.Eris_Angry} | Essa já é a terceira vez que eu disse pra voltar${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | Já chega né? você não vai conseguir outro daily tão rápido assim, volte${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | Pela terceira vez: VOLTE ${time(cooldown, "R")}!`,
                    `${icon.Eris_Angry} | Tá achando que eu sou o Siri? Pare de me perguntar a mesma coisa!`,
                    `${icon.Eris_Angry} | Já virou falta de educação! Terceira vez que aviso!`,
                    `${icon.Eris_Angry} | Eu devo ter dito umas 300 vezes pra voltar ${time(cooldown, "R")}`
                ]
                case 4: return [
                    `${icon.Eris_Angry} | Eu não vou repetir mais isso, por favor volte ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | Eu não vou repetir de novo.`,
                    `${icon.Eris_Angry} | O objetivo era me irritar? ótimo! conseguiu, agora não volte mais novamente.`,
                    `${icon.Eris_Angry} | Mas que coisa! pare com isso! não irei repetir isso!`,
                    `${icon.Eris_Angry} | Você está me testando? não vou repetir isso!`,
                    `${icon.Eris_Angry} | Já chega, não quero mais falar com você!`,
                    `${icon.Eris_Angry} | Chega! Meu limite de paciência acabou!`,
                    `${icon.Eris_Angry} | Pronto, cansei! Vou ignorar você até ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | Isso já virou assédio! Pare imediatamente!`,
                    `${icon.Eris_Angry} | Eu poderia te mutar por spam, sabia? Último aviso! Não falarei novamente.`
                ]
                default: return [];
            }
        },
        cooldown: (endIn: Date) => `${icon.denied} | Você já pegou seu prêmio diário hoje. Tente novamente ${time(endIn, "R")}`,
        messages: (dailyValue: number, petName: string, newUser: User) => {
            return {
                petDailyBonus: [
                    `${icon.Eris_enchanted} | Você recebeu **${dailyValue}** stx no daily, incluindo um bônus trazido por **${petName}**! Agora você tem **${newUser.money}** stx. ${icon.Eris_ok_left}`,
                    `${icon.Eris_enchanted} | Daily coletado: **${dailyValue}** stx (com bônus de **${petName}**) 🐾 Saldo atual: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | Prêmio diário recebido (**${dailyValue}** stx)! **${petName}** deu aquela força extra. Total em carteira: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | **${petName}** achou umas moedinhas perdidas 🐾 Você recebeu **${dailyValue}** stx no daily! Saldo: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | Daily recebido: **${dailyValue}** stx ${icon.money_bag} **${petName}** até abriu a própria carteira 😎 Total: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | Daily + bônus de **${petName}** ativado! Você recebeu **${dailyValue}** stx ✨ Saldo atual: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | Até **${petName}** trabalha mais que você… Recebeu **${dailyValue}** stx (bônus incluso). Agora tem **${newUser.money}** stx 😏`,
                    `${icon.Eris_enchanted} | **${petName}** cavou o quintal e trouxe **${dailyValue}** stx. Você só ficou parado olhando ${icon.paid}`,
                    `${icon.Eris_enchanted} | Daily recebido: **${dailyValue}** stx. O bônus foi de **${petName}**, não seu. Total: **${newUser.money}** stx.`
                ],
                petDailyCooldownReduction: [
                    `${icon.Eris_enchanted} | Você recebeu **${dailyValue}** stx no daily! **${petName}** ainda reduziu o tempo de espera para o próximo ⏱️`,
                    `${icon.Eris_enchanted} | Daily coletado: **${dailyValue}** stx. **${petName}** agilizou o cooldown do próximo daily.`,
                    `${icon.Eris_enchanted} | Prêmio diário de **${dailyValue}** stx recebido! **${petName}** mexeu no tempo pra você 😉`,
                    `${icon.Eris_enchanted} | **${petName}** foi tão rápido que até o tempo ficou com inveja ⏳ Você recebeu **${dailyValue}** stx!`,
                    `${icon.Eris_enchanted} | Daily recebido: **${dailyValue}** stx ${icon.paid} Enquanto isso, **${petName}** hackeou o relógio 🐾⌛`,
                    `${icon.Eris_enchanted} | Você ganhou **${dailyValue}** stx e **${petName}** ainda deu um jeitinho no tempo 😎`,
                    `${icon.Eris_enchanted} | Daily recebido: **${dailyValue}** stx. Sorte que **${petName}** compensou sua lerdeza e cortou o cooldown 😏`,
                    `${icon.Eris_enchanted} | Enquanto você comemorava seus **${dailyValue}** stx, **${petName}** resolveu o relógio. Impressionante.`,
                    `${icon.Eris_enchanted} | **${petName}** reduziu o cooldown. Você só pegou os **${dailyValue}** stx. Equilíbrio perfeito 🙄`
                ],
                petDailyBonusAndCooldownReduction: [
                    `${icon.Eris_enchanted} | Você recebeu **${dailyValue}** stx (daily + bônus de **${petName}**) e ainda teve o cooldown reduzido 🐾 Saldo: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | Daily completo: **${dailyValue}** stx recebidos com bônus + cooldown reduzido graças a **${petName}**.`,
                    `${icon.Eris_enchanted} | Prêmio diário de **${dailyValue}** stx recebido com bônus extra e cooldown adiantado. **${petName}** foi incrível hoje.`,
                    `${icon.Eris_enchanted} | Jackpot de **${petName}** 🐶💸 Você recebeu **${dailyValue}** stx e o próximo daily vem mais cedo! Total: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | **${petName}** ativou modo turbo: **${dailyValue}** stx + bônus + cooldown reduzido 😳`,
                    `${icon.Eris_enchanted} | Daily recebido: **${dailyValue}** stx. **${petName}** fez tudo — só faltou te servir café ☕`,
                    `${icon.Eris_enchanted} | Nem você merecia tanto: **${dailyValue}** stx recebidos, bônus incluso, e cooldown cortado por **${petName}** 😏`,
                    `${icon.Eris_enchanted} | **${petName}** fez o trabalho pesado: dinheiro (**${dailyValue}** stx) e tempo. Você só clicou.`,
                    `${icon.Eris_enchanted} | Daily + bônus + cooldown reduzido = **${dailyValue}** stx ganhos. Se dependesse de você, não vinha nada 🐾`
                ],
                normal: [
                    `${icon.Eris_enchanted} | Você recebeu **${dailyValue}** stx no daily. Agora possui **${newUser.money}** stx na carteira. ${icon.Eris_ok_left}`,
                    `${icon.Eris_enchanted} | Daily coletado com sucesso: **${dailyValue}** stx. Saldo atual: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | Prêmio diário de **${dailyValue}** stx recebido ${icon.paid}`,
                    `${icon.Eris_enchanted} | Daily coletado ${icon.paid} Você recebeu **${dailyValue}** stx e saiu com o bolso mais feliz 😎`,
                    `${icon.Eris_enchanted} | Você deu aquela passada diária e recebeu **${dailyValue}** stx ${icon.money_bag} Total: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | A carteira sorriu 🤑 **${dailyValue}** stx direto pra sua conta.`,
                    `${icon.Eris_enchanted} | Parabéns… por existir. Aqui estão seus **${dailyValue}** stx 😏`
                ]
            }
        },
        logMessage: (dailyValue: number) => `Recebeu seu prêmio diário de ${dailyValue} stx`
    },
    enus: {
        manyAttempts: (attempt: number, cooldown: Date) => {
            switch (attempt) {
                case 1: return [
                    `${icon.Eris_thinking} | Hey! I think I already told you to come back ${time(cooldown, "R")}, didn't I?`,
                    `${icon.Eris_thinking} | I think I already told you to come back ${time(cooldown, "R")}, didn't I?`,
                    `${icon.denied} | Please come back at the time I told you earlier!`,
                    `${icon.denied} | I already told you to come back ${time(cooldown, "R")}`,
                    `${icon.Eris_thinking} | Hold on! You need to wait until ${time(cooldown, "R")}`,
                    `${icon.denied} | Patience, young one! Your next daily only ${time(cooldown, "R")}`,
                    `${icon.Eris_thinking} | Hmm, someone seems anxious! Come back ${time(cooldown, "R")}`,
                    `${icon.denied} | Daily rewards don't grow on trees! Wait until ${time(cooldown, "R")}`
                ]
                case 2: return [
                    `${icon.Eris_Angry} | Hey! Again? I think I already told you to come back ${time(cooldown, "R")}, didn't I?`,
                    `${icon.Eris_Angry} | I already told you to come back ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | This is already the second time I've told you to come back ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | This is already the second time! Please come back ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | Are you kidding me? Second time I'm warning you! Come back ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | Think if you insist I'll give in? Come back ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | I'm tired of repeating! Second time I'm telling you to come back ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | Ugh, this again? Come back ${time(cooldown, "R")} as I already told you!`
                ]
                case 3: return [
                    `${icon.Eris_Angry} | Hey! Are you testing me? I already told you to come back ${time(cooldown, "R")} three times!`,
                    `${icon.Eris_Angry} | I already told you to come back ${time(cooldown, "R")} three times!`,
                    `${icon.Eris_Angry} | This is already the third time I've told you to come back ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | Enough already, right? You won't get another daily that fast, come back ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | For the third time: COME BACK ${time(cooldown, "R")}!`,
                    `${icon.Eris_Angry} | Think I'm Siri? Stop asking me the same thing!`,
                    `${icon.Eris_Angry} | This is becoming rude! Third time I'm warning you!`,
                    `${icon.Eris_Angry} | I must have said about 300 times to come back ${time(cooldown, "R")}`
                ]
                case 4: return [
                    `${icon.Eris_Angry} | I won't repeat this anymore, please come back ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | I won't repeat this again.`,
                    `${icon.Eris_Angry} | Was the goal to irritate me? Great! You succeeded, now don't come back again.`,
                    `${icon.Eris_Angry} | Good grief! Stop it! I won't repeat this!`,
                    `${icon.Eris_Angry} | Are you testing me? I won't repeat this!`,
                    `${icon.Eris_Angry} | Enough, I don't want to talk to you anymore!`,
                    `${icon.Eris_Angry} | Enough! My patience limit is over!`,
                    `${icon.Eris_Angry} | That's it, I'm tired! I'll ignore you until ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | This has become harassment! Stop immediately!`,
                    `${icon.Eris_Angry} | I could mute you for spam, you know? Last warning! I won't speak again.`
                ]
                default: return [];
            }
        },
        cooldown: (endIn: Date) => `${icon.denied} | You already collected your daily reward today. Try again ${time(endIn, "R")}`,
        messages: (dailyValue: number, petName: string, newUser: User) => {
            return {
                petDailyBonus: [
                    `${icon.Eris_enchanted} | You received **${dailyValue}** stx in the daily, including a bonus brought by **${petName}**! Now you have **${newUser.money}** stx. ${icon.Eris_ok_left}`,
                    `${icon.Eris_enchanted} | Daily collected: **${dailyValue}** stx (with **${petName}**'s bonus) 🐾 Current balance: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | Daily prize received (**${dailyValue}** stx)! **${petName}** gave that extra boost. Total in wallet: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | **${petName}** found some lost coins 🐾 You received **${dailyValue}** stx in the daily! Balance: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | Daily received: **${dailyValue}** stx ${icon.money_bag} **${petName}** even opened their own wallet 😎 Total: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | Daily + **${petName}** bonus activated! You received **${dailyValue}** stx ✨ Current balance: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | Even **${petName}** works harder than you… Received **${dailyValue}** stx (bonus included). Now you have **${newUser.money}** stx 😏`,
                    `${icon.Eris_enchanted} | **${petName}** dug the backyard and brought **${dailyValue}** stx. You just stood there watching ${icon.paid}`,
                    `${icon.Eris_enchanted} | Daily received: **${dailyValue}** stx. The bonus was from **${petName}**, not you. Total: **${newUser.money}** stx.`
                ],
                petDailyCooldownReduction: [
                    `${icon.Eris_enchanted} | You received **${dailyValue}** stx in the daily! **${petName}** also reduced the waiting time for the next one ⏱️`,
                    `${icon.Eris_enchanted} | Daily collected: **${dailyValue}** stx. **${petName}** sped up the cooldown for the next daily.`,
                    `${icon.Eris_enchanted} | Daily prize of **${dailyValue}** stx received! **${petName}** messed with time for you 😉`,
                    `${icon.Eris_enchanted} | **${petName}** was so fast even time got jealous ⏳ You received **${dailyValue}** stx!`,
                    `${icon.Eris_enchanted} | Daily received: **${dailyValue}** stx ${icon.paid} Meanwhile, **${petName}** hacked the clock 🐾⌛`,
                    `${icon.Eris_enchanted} | You earned **${dailyValue}** stx and **${petName}** even fixed the time 😎`,
                    `${icon.Eris_enchanted} | Daily received: **${dailyValue}** stx. Lucky that **${petName}** compensated for your slowness and cut the cooldown 😏`,
                    `${icon.Eris_enchanted} | While you were celebrating your **${dailyValue}** stx, **${petName}** fixed the clock. Impressive.`,
                    `${icon.Eris_enchanted} | **${petName}** reduced the cooldown. You just took the **${dailyValue}** stx. Perfect balance 🙄`
                ],
                petDailyBonusAndCooldownReduction: [
                    `${icon.Eris_enchanted} | You received **${dailyValue}** stx (daily + **${petName}**'s bonus) and also had the cooldown reduced 🐾 Balance: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | Complete daily: **${dailyValue}** stx received with bonus + cooldown reduced thanks to **${petName}**.`,
                    `${icon.Eris_enchanted} | Daily prize of **${dailyValue}** stx received with extra bonus and advanced cooldown. **${petName}** was amazing today.`,
                    `${icon.Eris_enchanted} | **${petName}**'s jackpot 🐶💸 You received **${dailyValue}** stx and the next daily comes earlier! Total: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | **${petName}** activated turbo mode: **${dailyValue}** stx + bonus + reduced cooldown 😳`,
                    `${icon.Eris_enchanted} | Daily received: **${dailyValue}** stx. **${petName}** did everything — just didn't serve you coffee ☕`,
                    `${icon.Eris_enchanted} | Not even you deserved that much: **${dailyValue}** stx received, bonus included, and cooldown cut by **${petName}** 😏`,
                    `${icon.Eris_enchanted} | **${petName}** did the heavy work: money (**${dailyValue}** stx) and time. You just clicked.`,
                    `${icon.Eris_enchanted} | Daily + bonus + reduced cooldown = **${dailyValue}** stx earned. If it depended on you, nothing would come 🐾`
                ],
                normal: [
                    `${icon.Eris_enchanted} | You received **${dailyValue}** stx in the daily. You now have **${newUser.money}** stx in your wallet. ${icon.Eris_ok_left}`,
                    `${icon.Eris_enchanted} | Daily successfully collected: **${dailyValue}** stx. Current balance: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | Daily prize of **${dailyValue}** stx received ${icon.paid}`,
                    `${icon.Eris_enchanted} | Daily collected ${icon.paid} You received **${dailyValue}** stx and left with a happier pocket 😎`,
                    `${icon.Eris_enchanted} | You made that daily stop and received **${dailyValue}** stx ${icon.money_bag} Total: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | The wallet smiled 🤑 **${dailyValue}** stx straight to your account.`,
                    `${icon.Eris_enchanted} | Congratulations… for existing. Here are your **${dailyValue}** stx 😏`
                ]
            }
        },
        logMessage: (dailyValue: number) => `Received their daily prize of ${dailyValue} stx`
    },
    eses: {
        manyAttempts: (attempt: number, cooldown: Date) => {
            switch (attempt) {
                case 1: return [
                    `${icon.Eris_thinking} | ¡Oye! Creo que ya te dije que volvieras ${time(cooldown, "R")}, ¿no?`,
                    `${icon.Eris_thinking} | Creo que ya te dije que volvieras ${time(cooldown, "R")}, ¿no?`,
                    `${icon.denied} | ¡Por favor vuelve a la hora que te dije anteriormente!`,
                    `${icon.denied} | Ya te dije que volvieras ${time(cooldown, "R")}`,
                    `${icon.Eris_thinking} | ¡Espera! Necesitas esperar hasta ${time(cooldown, "R")}`,
                    `${icon.denied} | ¡Paciencia, joven! Tu próximo daily solo ${time(cooldown, "R")}`,
                    `${icon.Eris_thinking} | ¡Hmm, alguien parece ansioso! Vuelve ${time(cooldown, "R")}`,
                    `${icon.denied} | ¡Las recompensas diarias no crecen en los árboles! Espera hasta ${time(cooldown, "R")}`
                ]
                case 2: return [
                    `${icon.Eris_Angry} | ¡Oye! ¿Otra vez? Creo que ya te dije que volvieras ${time(cooldown, "R")}, ¿no?`,
                    `${icon.Eris_Angry} | Ya te dije que volvieras ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | Esta es ya la segunda vez que te digo que vuelvas ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | ¡Esta es ya la segunda vez! Por favor vuelve ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | ¿Me estás tomando el pelo? ¡Segunda vez que te advierto! Vuelve ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | ¿Crees que si insistes cederé? Vuelve ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | ¡Estoy cansado de repetir! Segunda vez que te digo que vuelvas ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | ¡Uf, ¿otra vez esto? Vuelve ${time(cooldown, "R")} como ya te dije!`
                ]
                case 3: return [
                    `${icon.Eris_Angry} | ¡Oye! ¿Me estás probando? Ya te dije que volvieras ${time(cooldown, "R")} ¡tres veces!`,
                    `${icon.Eris_Angry} | ¡Ya te dije que volvieras ${time(cooldown, "R")} tres veces!`,
                    `${icon.Eris_Angry} | Esta es ya la tercera vez que te digo que vuelvas ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | Ya basta, ¿verdad? No conseguirás otro daily tan rápido, vuelve ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | Por tercera vez: ¡VUELVE ${time(cooldown, "R")}!`,
                    `${icon.Eris_Angry} | ¿Crees que soy Siri? ¡Deja de preguntarme lo mismo!`,
                    `${icon.Eris_Angry} | ¡Esto se está volviendo grosero! ¡Tercera vez que te advierto!`,
                    `${icon.Eris_Angry} | Debo haber dicho como 300 veces que volvieras ${time(cooldown, "R")}`
                ]
                case 4: return [
                    `${icon.Eris_Angry} | No repetiré esto más, por favor vuelve ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | No repetiré esto de nuevo.`,
                    `${icon.Eris_Angry} | ¿El objetivo era irritarme? ¡Genial! Lo conseguiste, ahora no vuelvas más.`,
                    `${icon.Eris_Angry} | ¡Por Dios! ¡Para! No repetiré esto.`,
                    `${icon.Eris_Angry} | ¿Me estás probando? No repetiré esto.`,
                    `${icon.Eris_Angry} | ¡Basta, ya no quiero hablar contigo!`,
                    `${icon.Eris_Angry} | ¡Basta! ¡Mi límite de paciencia se acabó!`,
                    `${icon.Eris_Angry} | ¡Listo, me cansé! Te ignoraré hasta ${time(cooldown, "R")}`,
                    `${icon.Eris_Angry} | ¡Esto se ha vuelto acoso! ¡Para inmediatamente!`,
                    `${icon.Eris_Angry} | Podría silenciarte por spam, ¿sabes? ¡Última advertencia! No hablaré nuevamente.`
                ]
                default: return [];
            }
        },
        cooldown: (endIn: Date) => `${icon.denied} | Ya recogiste tu recompensa diaria hoy. Intenta nuevamente ${time(endIn, "R")}`,
        messages: (dailyValue: number, petName: string, newUser: User) => {
            return {
                petDailyBonus: [
                    `${icon.Eris_enchanted} | Recibiste **${dailyValue}** stx en el daily, ¡incluyendo un bono traído por **${petName}**! Ahora tienes **${newUser.money}** stx. ${icon.Eris_ok_left}`,
                    `${icon.Eris_enchanted} | Daily recolectado: **${dailyValue}** stx (con el bono de **${petName}**) 🐾 Saldo actual: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | ¡Premio diario recibido (**${dailyValue}** stx)! **${petName}** dio ese impulso extra. Total en cartera: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | **${petName}** encontró algunas monedas perdidas 🐾 ¡Recibiste **${dailyValue}** stx en el daily! Saldo: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | Daily recibido: **${dailyValue}** stx ${icon.money_bag} **${petName}** hasta abrió su propia cartera 😎 Total: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | ¡Daily + bono de **${petName}** activado! Recibiste **${dailyValue}** stx ✨ Saldo actual: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | Hasta **${petName}** trabaja más que tú… Recibiste **${dailyValue}** stx (bono incluido). Ahora tienes **${newUser.money}** stx 😏`,
                    `${icon.Eris_enchanted} | **${petName}** excavó el patio y trajo **${dailyValue}** stx. Tú solo te quedaste mirando ${icon.paid}`,
                    `${icon.Eris_enchanted} | Daily recibido: **${dailyValue}** stx. El bono fue de **${petName}**, no tuyo. Total: **${newUser.money}** stx.`
                ],
                petDailyCooldownReduction: [
                    `${icon.Eris_enchanted} | ¡Recibiste **${dailyValue}** stx en el daily! **${petName}** también redujo el tiempo de espera para el siguiente ⏱️`,
                    `${icon.Eris_enchanted} | Daily recolectado: **${dailyValue}** stx. **${petName}** aceleró el cooldown para el próximo daily.`,
                    `${icon.Eris_enchanted} | ¡Premio diario de **${dailyValue}** stx recibido! **${petName}** manipuló el tiempo por ti 😉`,
                    `${icon.Eris_enchanted} | **${petName}** fue tan rápido que hasta el tiempo tuvo envidia ⏳ ¡Recibiste **${dailyValue}** stx!`,
                    `${icon.Eris_enchanted} | Daily recibido: **${dailyValue}** stx ${icon.paid} Mientras tanto, **${petName}** hackeó el reloj 🐾⌛`,
                    `${icon.Eris_enchanted} | Ganaste **${dailyValue}** stx y **${petName}** incluso arregló el tiempo 😎`,
                    `${icon.Eris_enchanted} | Daily recibido: **${dailyValue}** stx. Suerte que **${petName}** compensó tu lentitud y cortó el cooldown 😏`,
                    `${icon.Eris_enchanted} | Mientras celebrabas tus **${dailyValue}** stx, **${petName}** arregló el reloj. Impresionante.`,
                    `${icon.Eris_enchanted} | **${petName}** redujo el cooldown. Tú solo tomaste los **${dailyValue}** stx. Equilibrio perfecto 🙄`
                ],
                petDailyBonusAndCooldownReduction: [
                    `${icon.Eris_enchanted} | Recibiste **${dailyValue}** stx (daily + bono de **${petName}**) y también tuviste el cooldown reducido 🐾 Saldo: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | Daily completo: **${dailyValue}** stx recibidos con bono + cooldown reducido gracias a **${petName}**.`,
                    `${icon.Eris_enchanted} | Premio diario de **${dailyValue}** stx recibido con bono extra y cooldown adelantado. **${petName}** fue increíble hoy.`,
                    `${icon.Eris_enchanted} | Jackpot de **${petName}** 🐶💸 ¡Recibiste **${dailyValue}** stx y el próximo daily viene antes! Total: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | **${petName}** activó modo turbo: **${dailyValue}** stx + bono + cooldown reducido 😳`,
                    `${icon.Eris_enchanted} | Daily recibido: **${dailyValue}** stx. **${petName}** hizo todo — solo faltó servirte café ☕`,
                    `${icon.Eris_enchanted} | Ni tú merecías tanto: **${dailyValue}** stx recibidos, bono incluido, y cooldown cortado por **${petName}** 😏`,
                    `${icon.Eris_enchanted} | **${petName}** hizo el trabajo pesado: dinero (**${dailyValue}** stx) y tiempo. Tú solo hiciste clic.`,
                    `${icon.Eris_enchanted} | Daily + bono + cooldown reducido = **${dailyValue}** stx ganados. Si dependiera de ti, no vendría nada 🐾`
                ],
                normal: [
                    `${icon.Eris_enchanted} | Recibiste **${dailyValue}** stx en el daily. Ahora tienes **${newUser.money}** stx en tu cartera. ${icon.Eris_ok_left}`,
                    `${icon.Eris_enchanted} | Daily recolectado con éxito: **${dailyValue}** stx. Saldo actual: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | Premio diario de **${dailyValue}** stx recibido ${icon.paid}`,
                    `${icon.Eris_enchanted} | Daily recolectado ${icon.paid} Recibiste **${dailyValue}** stx y saliste con el bolsillo más feliz 😎`,
                    `${icon.Eris_enchanted} | Hiciste esa parada diaria y recibiste **${dailyValue}** stx ${icon.money_bag} Total: **${newUser.money}** stx.`,
                    `${icon.Eris_enchanted} | La cartera sonrió 🤑 **${dailyValue}** stx directo a tu cuenta.`,
                    `${icon.Eris_enchanted} | Felicitaciones… por existir. Aquí tienes tus **${dailyValue}** stx 😏`
                ]
            }
        },
        logMessage: (dailyValue: number) => `Recibió su premio diario de ${dailyValue} stx`
    }
}