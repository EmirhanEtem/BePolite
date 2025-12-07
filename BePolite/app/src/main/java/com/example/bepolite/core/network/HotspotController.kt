package com.example.bepolite.core.network

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.net.wifi.WifiManager
import android.os.Build
import androidx.core.content.ContextCompat
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject

class HotspotController @Inject constructor(@ApplicationContext private val context: Context) {

    private val wifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager

    private val _hotspotStatus = MutableLiveData<HotspotStatus>()
    val hotspotStatus: LiveData<HotspotStatus> = _hotspotStatus

    private var reservation: WifiManager.LocalOnlyHotspotReservation? = null

    fun startLocalHotspot() {
        val requiredPermissions = mutableListOf(Manifest.permission.ACCESS_FINE_LOCATION)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            requiredPermissions.add(Manifest.permission.NEARBY_WIFI_DEVICES)
        }

        val allPermissionsGranted = requiredPermissions.all {
            ContextCompat.checkSelfPermission(context, it) == PackageManager.PERMISSION_GRANTED
        }

        if (!allPermissionsGranted) {
            _hotspotStatus.postValue(HotspotStatus.Failed)
            return
        }

        try {
            wifiManager.startLocalOnlyHotspot(object : WifiManager.LocalOnlyHotspotCallback() {
                override fun onStarted(reservation: WifiManager.LocalOnlyHotspotReservation) {
                    super.onStarted(reservation)
                    this@HotspotController.reservation = reservation
                    _hotspotStatus.postValue(
                        HotspotStatus.Started(
                            reservation.softApConfiguration.ssid,
                            reservation.softApConfiguration.passphrase
                        )
                    )
                }

                override fun onStopped() {
                    super.onStopped()
                    _hotspotStatus.postValue(HotspotStatus.Stopped)
                }

                override fun onFailed(reason: Int) {
                    super.onFailed(reason)
                    _hotspotStatus.postValue(HotspotStatus.Failed)
                }
            }, null)
        } catch (e: SecurityException) {
            _hotspotStatus.postValue(HotspotStatus.Failed)
        }
    }

    fun stopLocalHotspot() {
        reservation?.close()
        reservation = null
    }
}

sealed class HotspotStatus {
    data class Started(val ssid: String?, val password: String?) : HotspotStatus()
    object Stopped : HotspotStatus()
    object Failed : HotspotStatus()
}