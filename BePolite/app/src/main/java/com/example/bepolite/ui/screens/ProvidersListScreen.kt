package com.example.bepolite.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.bepolite.core.network.PeerMetadata
import com.example.bepolite.ui.viewmodels.ProvidersViewModel

@Composable
fun ProvidersListScreen(viewModel: ProvidersViewModel = hiltViewModel()) {
    val peers = viewModel.discoveredPeers.observeAsState(initial = emptyList())
    val bestProvider = viewModel.bestProvider.observeAsState()

    DisposableEffect(Unit) {
        viewModel.startDiscovery()
        onDispose {
            viewModel.stopDiscovery()
        }
    }

    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Button(onClick = { viewModel.selectBestProvider() }) {
            Text("Find Best Provider")
        }
        bestProvider.value?.let {
            Text("Best Provider: ${it.deviceName}")
        }
        LazyColumn {
            items(peers.value) { peer ->
                PeerItem(peer)
            }
        }
    }
}

@Composable
fun PeerItem(peer: PeerMetadata) {
    Text(text = peer.deviceName)
}