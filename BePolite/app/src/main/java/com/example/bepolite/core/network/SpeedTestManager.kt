package com.example.bepolite.core.network

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.InputStream
import java.io.OutputStream
import java.net.InetSocketAddress
import java.net.Socket
import javax.inject.Inject

class SpeedTestManager @Inject constructor() {

    suspend fun runTcpThroughputTest(host: String, port: Int): Double = withContext(Dispatchers.IO) {
        var socket: Socket? = null
        var totalBytes = 0L
        val startTime = System.currentTimeMillis()

        try {
            socket = Socket()
            socket.connect(InetSocketAddress(host, port), 5000)
            val outputStream: OutputStream = socket.getOutputStream()
            val inputStream: InputStream = socket.getInputStream()

            val buffer = ByteArray(8192)
            val testDuration = 5000 // 5 seconds

            while (System.currentTimeMillis() - startTime < testDuration) {
                outputStream.write(buffer)
                totalBytes += buffer.size
            }

            val endTime = System.currentTimeMillis()
            val durationSeconds = (endTime - startTime) / 1000.0
            return@withContext (totalBytes * 8) / (durationSeconds * 1_000_000) // Mbps
        } finally {
            socket?.close()
        }
    }

    suspend fun runUdpLatencyTest(host: String, port: Int): Long = withContext(Dispatchers.IO) {
        // TODO: Implement UDP latency test
        return@withContext -1L
    }
}