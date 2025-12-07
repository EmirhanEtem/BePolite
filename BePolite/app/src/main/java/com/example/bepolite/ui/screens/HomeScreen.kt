package com.example.bepolite.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.navigation.NavController

@Composable
fun HomeScreen(navController: NavController) {
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Button(onClick = { navController.navigate("hotspot") }) {
            Text("Hotspot Status")
        }
        Button(onClick = { navController.navigate("providers") }) {
            Text("Providers List")
        }
        Button(onClick = { navController.navigate("speedtest") }) {
            Text("Speed Test")
        }
        Button(onClick = { navController.navigate("settings") }) {
            Text("Settings")
        }
    }
}