package studio.styx.logic

import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.Transaction
import org.jetbrains.exposed.sql.transactions.TransactionManager
import java.sql.Connection
import java.sql.PreparedStatement
import java.sql.ResultSet
import java.util.concurrent.locks.ReentrantLock
import kotlin.concurrent.withLock

object DatabaseManager {
    private var database: Database? = null
    private val lock = ReentrantLock()
    private val tables = mutableListOf<Table>()
    @Volatile private var initialized = false

    // Inicialização do banco de dados
    fun initialize(dbPath: String) {
        if (initialized) return

        lock.withLock {
            if (initialized) return

            database = Database.connect(
                url = "jdbc:sqlite:$dbPath",
                driver = "org.sqlite.JDBC"
            )

            TransactionManager.manager.defaultIsolationLevel =
                Connection.TRANSACTION_SERIALIZABLE

            // Criar tabelas imediatamente após conectar
            createTables()
            initialized = true
        }
    }

    // Registrar e criar tabelas
    fun registerTable(table: Table) {
        lock.withLock {
            tables.add(table)
            // Se já inicializado, cria a tabela imediatamente
            if (initialized) {
                transaction {
                    SchemaUtils.createMissingTablesAndColumns(table)
                }
            }
        }
    }

    private fun createTables() {
        if (tables.isEmpty()) return

        transaction {
            SchemaUtils.createMissingTablesAndColumns(*tables.toTypedArray())
        }
    }

    fun getConnection(): Connection {
        return lock.withLock {
            check(database != null) { "Database not initialized" }
            TransactionManager.current().connection.connection as Connection
        }
    }

    // Executar query SQL com parâmetros e tipagem
    fun <T> query(
        sql: String,
        params: List<Any> = emptyList(),
        mapper: (ResultSet) -> T
    ): List<T> {
        return transaction {
            getConnection().prepareStatement(sql).use { stmt ->
                setParameters(stmt, params)
                stmt.executeQuery().use { rs ->
                    val results = mutableListOf<T>()
                    while (rs.next()) {
                        results.add(mapper(rs))
                    }
                    results
                }
            }
        }
    }

    // Executar uma única query com tipagem
    fun <T> queryOne(
        sql: String,
        params: List<Any> = emptyList(),
        mapper: (ResultSet) -> T
    ): T? {
        return query(sql, params, mapper).firstOrNull()
    }

    fun execute(query: String, params: List<Any> = emptyList()) {
        lock.withLock {
            getConnection().prepareStatement(query).use { statement ->
                setParameters(statement, params)
                statement.executeUpdate()
            }
        }
    }

    // Método auxiliar para definir parâmetros no PreparedStatement
    private fun setParameters(stmt: PreparedStatement, params: List<Any>) {
        params.forEachIndexed { index, value ->
            when (value) {
                is Int -> stmt.setInt(index + 1, value)
                is Long -> stmt.setLong(index + 1, value)
                is String -> stmt.setString(index + 1, value)
                is Boolean -> stmt.setBoolean(index + 1, value)
                is Float -> stmt.setFloat(index + 1, value)
                is Double -> stmt.setDouble(index + 1, value)
                is ByteArray -> stmt.setBytes(index + 1, value)
                else -> stmt.setObject(index + 1, value)
            }
        }
    }

    // Versão tipada da transaction original
    fun <T> transaction(block: Transaction.() -> T): T {
        return lock.withLock {
            org.jetbrains.exposed.sql.transactions.transaction {
                block()
            }
        }
    }
}

object UsersTable : Table("users") {
    val id = varchar("id", 64)
    val money = double("money").default(0.0)
    val bank = double("bank").default(50.0)
    val xp = integer("xp").default(0)

    override val primaryKey = PrimaryKey(id)
}