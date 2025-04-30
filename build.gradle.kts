plugins {
    kotlin("jvm") version "2.1.20"
}

group = "studio.styx"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(kotlin("test"))

    implementation("net.dv8tion:JDA:5.5.0")

    implementation("org.jetbrains.exposed:exposed-core:0.61.0")
    implementation("org.jetbrains.exposed:exposed-dao:0.61.0")
    implementation("org.jetbrains.exposed:exposed-jdbc:0.61.0")
    implementation("org.xerial:sqlite-jdbc:3.49.1.0")
    implementation("com.google.code.gson:gson:2.13.1")
    implementation("io.github.cdimascio:dotenv-kotlin:6.4.1")
}

tasks.test {
    useJUnitPlatform()
}
kotlin {
    jvmToolchain(21)
}