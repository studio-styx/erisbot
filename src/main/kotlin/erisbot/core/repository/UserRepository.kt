package studio.styx.erisbot.core.repository

import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import studio.styx.erisbot.core.dtos.UserDTO
import studio.styx.logic.DatabaseManager
import studio.styx.logic.UsersTable

class UserRepository(private val userId: String) {
    init {
        DatabaseManager.registerTable(UsersTable)
        DatabaseManager.initialize("database.sqlite")
    }

    private fun ensureUserExists() {
        transaction {
            val exists = UsersTable.select(UsersTable.id eq userId).count() > 0
            if (!exists) {
                UsersTable.insert {
                    it[id] = userId
                    it[money] = 0.0
                    it[bank] = 50.0
                    it[xp] = 0
                }
            }
        }
    }

    fun getUser(): UserDTO? = transaction {
        UsersTable.select(UsersTable.id eq userId).map {
            UserDTO(
                id = it[UsersTable.id],
                money = it[UsersTable.money],
                bank = it[UsersTable.bank],
                xp = it[UsersTable.xp]
            )
        }.firstOrNull()
    }

    fun getMoney(): Double = getUser()?.money ?: 0.0
    fun getBank(): Double = getUser()?.bank ?: 0.0
    fun getXP(): Int = getUser()?.xp ?: 0

    fun setMoney(money: Double) = transaction {
        UsersTable.update({ UsersTable.id eq userId }) {
            it[UsersTable.money] = money
        }
    }

    fun setBank(bank: Double) = transaction {
        UsersTable.update({ UsersTable.id eq userId }) {
            it[UsersTable.bank] = bank
        }
    }

    fun setXP(xp: Int) = transaction {
        UsersTable.update({ UsersTable.id eq userId }) {
            it[UsersTable.xp] = xp
        }
    }

    fun deposit(amount: Double) = transaction {
        val user = getUser() ?: return@transaction
        setMoney(user.money - amount)
        setBank(user.bank + amount)
    }

    fun withdraw(amount: Double) = transaction {
        val user = getUser() ?: return@transaction
        setMoney(user.money + amount)
        setBank(user.bank - amount)
    }
}