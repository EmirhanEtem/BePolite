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
import com.example.bepolite.ui.viewmodels.SpeedTestViewModel

@Composable
fun SpeedTestScreen(viewModel: SpeedTestViewModel = hiltViewModel()) {
    val speed = viewModel.speed.observeAsState()

    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Button(onClick = { viewModel.runSpeedTest() }) {
            Text("Run Speed Test")
        }
        speed.value?.let {
            Text("Speed: %.2f Mbps".format(it))
        }
    }
}