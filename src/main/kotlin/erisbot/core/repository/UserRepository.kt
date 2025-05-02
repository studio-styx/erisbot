package studio.styx.erisbot.core.repository

import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import studio.styx.erisbot.core.dtos.UserDTO
import studio.styx.logic.DatabaseManager
import studio.styx.logic.UsersTable

class UserRepository(val user: String) {
    val database = DatabaseManager

    init {
        DatabaseManager.registerTable(UsersTable)
        DatabaseManager.initialize("database.sqlite")
    }

    private fun ensureUserExists() {
        database.transaction {
            val userExists = UsersTable.select(UsersTable.id eq user).count() > 0
            if (!userExists) {
                createUser()
            }
        }
    }

    fun getUser(): UserDTO? {
        ensureUserExists()
        return DatabaseManager.queryOne<UserDTO>(
            "SELECT * FROM users WHERE id = ?",
            listOf(user)
        ) { rs ->
            UserDTO(
                id = rs.getString("id"),
                money = rs.getDouble("money"),
                bank = rs.getDouble("bank"),
                xp = rs.getInt("xp")
            )
        }
    }

    fun getMoney(): Double {
        ensureUserExists()
        val userData = getUser()
        return userData?.money ?: 0.0
    }

    fun getBank(): Double {
        ensureUserExists()
        val userData = getUser()
        return userData?.bank ?: 0.0
    }

    fun getXP(): Int {
        ensureUserExists()
        val userData = getUser()
        return userData?.xp ?: 0
    }

    fun setMoney(money: Double) {
        ensureUserExists()
        DatabaseManager.execute(
            "UPDATE users SET money = ? WHERE id = ?",
            listOf(money, user)
        )
    }

    fun setBank(bank: Double) {
        ensureUserExists()
        DatabaseManager.execute(
            "UPDATE users SET bank = ? WHERE id = ?",
            listOf(bank, user)
        )
    }

    fun setXP(xp: Int) {
        ensureUserExists()
        DatabaseManager.execute(
            "UPDATE users SET xp = ? WHERE id = ?",
            listOf(xp, user)
        )
    }

    fun addMoney(money: Double) {
        ensureUserExists()
        val currentMoney = getMoney()
        setMoney(currentMoney + money)
    }

    fun subMoney(money: Double) {
        ensureUserExists()
        val currentMoney = getMoney()
        setMoney(currentMoney - money)
    }

    fun addBank(bank: Double) {
        ensureUserExists()
        val currentBank = getBank()
        setBank(currentBank + bank)
    }

    fun subBank(bank: Double) {
        ensureUserExists()
        val currentBank = getBank()
        setBank(currentBank - bank)
    }

    fun addXP(xp: Int) {
        ensureUserExists()
        val currentXP = getXP()
        setXP(currentXP + xp)
    }

    fun subXP(xp: Int) {
        ensureUserExists()
        val currentXP = getXP()
        setXP(currentXP - xp)
    }

    fun deposit(money: Double) {
        ensureUserExists()
        val currentMoney = getMoney()
        val currentBank = getBank()
        setMoney(currentMoney - money)
        setBank(currentBank + money)
    }

    fun withdraw(money: Double) {
        ensureUserExists()
        val currentMoney = getMoney()
        val currentBank = getBank()
        setMoney(currentMoney + money)
        setBank(currentBank - money)
    }

    fun createUser() {
        DatabaseManager.execute(
            "INSERT INTO users (id, money, bank, xp) VALUES (?, ?, ?, ?)",
            listOf(user, 0.0, 50.0, 0)
        )
    }
}