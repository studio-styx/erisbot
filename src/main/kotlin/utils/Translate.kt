package studio.styx.utils

import com.google.gson.Gson
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import java.io.File

class Translate(private var language: String = "en_us") {

    private val gson = Gson()
    private val basePath = "src/main/resources/locales"

    fun getTranslate(area: String, file: String, path: String, placeholders: Map<String, String> = emptyMap()): String? {
        val filePath = "$basePath/$language/$area/$file.json"
        val jsonFile = File(filePath)

        if (!jsonFile.exists()) {
            println("Arquivo de tradução não encontrado: $filePath")
            return null
        }

        val jsonObject = gson.fromJson(jsonFile.readText(), JsonObject::class.java)
        val keys = path.split(".")
        var currentElement: JsonElement = jsonObject

        for (key in keys) {
            if (currentElement.isJsonObject) {
                currentElement = currentElement.asJsonObject.get(key) ?: return null
            } else {
                return null
            }
        }

        val result = when {
            currentElement.isJsonArray -> {
                // Concatena os elementos da array com "" entre eles
                currentElement.asJsonArray.joinToString(separator = "") { it.asString }
            }
            currentElement.isJsonPrimitive && currentElement.asJsonPrimitive.isString -> {
                currentElement.asString
            }
            else -> return null
        }

        var finalResult = result
        placeholders.forEach { (key, value) ->
            finalResult = finalResult.replace("$$key", value)
        }

        return finalResult

    }
}
