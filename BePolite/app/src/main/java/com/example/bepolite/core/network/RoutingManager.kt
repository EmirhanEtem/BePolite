package com.example.bepolite.core.network

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import javax.inject.Inject

class RoutingManager @Inject constructor(private val speedTestManager: SpeedTestManager) {

    private val _bestProvider = MutableLiveData<PeerMetadata>()
    val bestProvider: LiveData<PeerMetadata> = _bestProvider

    suspend fun selectBestProvider(peers: List<PeerMetadata>) {
        var bestPeer: PeerMetadata? = null
        var bestSpeed = 0.0

        for (peer in peers) {
            // TODO: Get host and port from peer metadata
            val speed = speedTestManager.runTcpThroughputTest("host", 1234)
            if (speed > bestSpeed) {
                bestSpeed = speed
                bestPeer = peer
            }
        }

        _bestProvider.postValue(bestPeer)
    }

    // TODO: Implement automatic reconnection logic and bandwidth allocation rules
}