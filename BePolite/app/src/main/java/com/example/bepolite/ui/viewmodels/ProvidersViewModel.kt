package com.example.bepolite.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.bepolite.core.network.PeerDiscovery
import com.example.bepolite.core.network.RoutingManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProvidersViewModel @Inject constructor(
    private val peerDiscovery: PeerDiscovery,
    private val routingManager: RoutingManager
) : ViewModel() {

    val discoveredPeers = peerDiscovery.discoveredPeers
    val bestProvider = routingManager.bestProvider

    fun startDiscovery() {
        peerDiscovery.startDiscovery()
    }

    fun stopDiscovery() {
        peerDiscovery.stopDiscovery()
    }

    fun selectBestProvider() {
        discoveredPeers.value?.let {
            viewModelScope.launch {
                routingManager.selectBestProvider(it)
            }
        }
    }
}