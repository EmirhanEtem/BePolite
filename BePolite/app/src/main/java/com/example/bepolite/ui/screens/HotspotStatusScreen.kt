package com.example.bepolite.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.bepolite.core.network.HotspotStatus
import com.example.bepolite.ui.viewmodels.HotspotViewModel

@Composable
fun HotspotStatusScreen(viewModel: HotspotViewModel = hiltViewModel()) {
    val status = viewModel.hotspotStatus.observeAsState()

    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        when (val currentStatus = status.value) {
            is HotspotStatus.Started -> {
                Text("Hotspot Started")
                currentStatus.ssid?.let { ssid ->
                    Text("SSID: $ssid")
                } ?: Text("SSID: Not available")

                currentStatus.password?.let { password ->
                    Text("Password: $password")
                } ?: Text("Password: Not available")

                Button(onClick = { viewModel.stopHotspot() }) {
                    Text("Stop Hotspot")
                }
            }
            HotspotStatus.Stopped -> {
                Text("Hotspot Stopped")
                Button(onClick = { viewModel.startHotspot() }) {
                    Text("Start Hotspot")
                }
            }
            HotspotStatus.Failed -> Text("Hotspot Failed")
            null -> {
                Text("Hotspot Stopped")
                Button(onClick = { viewModel.startHotspot() }) {
                    Text("Start Hotspot")
                }
            }
        }
    }
}