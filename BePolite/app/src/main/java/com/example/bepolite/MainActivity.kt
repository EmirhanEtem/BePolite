package com.example.bepolite

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.bepolite.ui.screens.*
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            NeighborNetNavHost()
        }
    }
}

@Composable
fun NeighborNetNavHost() {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = "home") {
        composable("home") { HomeScreen(navController) }
        composable("hotspot") { HotspotStatusScreen() }
        composable("providers") { ProvidersListScreen() }
        composable("speedtest") { SpeedTestScreen() }
        composable("settings") { SettingsScreen() }
    }
}