package com.example.bepolite.ui.viewmodels

import androidx.lifecycle.ViewModel
import com.example.bepolite.core.network.HotspotController
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class HotspotViewModel @Inject constructor(private val hotspotController: HotspotController) : ViewModel() {

    val hotspotStatus = hotspotController.hotspotStatus

    fun startHotspot() {
        hotspotController.startLocalHotspot()
    }

    fun stopHotspot() {
        hotspotController.stopLocalHotspot()
    }
}