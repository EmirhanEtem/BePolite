package com.example.bepolite.core.network

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.net.wifi.p2p.WifiP2pDevice
import android.net.wifi.p2p.WifiP2pManager
import android.os.Looper
import androidx.core.app.ActivityCompat
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject

data class PeerMetadata(
    val deviceName: String,
    val batteryPercentage: Int,
    val availableBandwidth: Int,
    val isSharing: Boolean
)

class PeerDiscovery @Inject constructor(@ApplicationContext private val context: Context) {

    private val wifiP2pManager: WifiP2pManager? by lazy {
        context.getSystemService(Context.WIFI_P2P_SERVICE) as? WifiP2pManager
    }

    private var channel: WifiP2pManager.Channel? = null

    private val _discoveredPeers = MutableLiveData<List<PeerMetadata>>()
    val discoveredPeers: LiveData<List<PeerMetadata>> = _discoveredPeers

    private val peerListListener = WifiP2pManager.PeerListListener {
        val peers = it.deviceList.map { device ->
            // TODO: Exchange metadata with peers
            PeerMetadata(device.deviceName, 0, 0, false)
        }
        _discoveredPeers.postValue(peers)
    }

    fun startDiscovery() {
        if (ActivityCompat.checkSelfPermission(
                context,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            // Permissions are not granted, handle this appropriately
            return
        }
        channel = wifiP2pManager?.initialize(context, Looper.getMainLooper(), null)
        wifiP2pManager?.discoverPeers(channel, object : WifiP2pManager.ActionListener {
            override fun onSuccess() {
                // Discovery initiated
            }

            override fun onFailure(reason: Int) {
                // Discovery initiation failed
            }
        })

        // TODO: Implement Bluetooth LE fallback
    }

    fun stopDiscovery() {
        wifiP2pManager?.stopPeerDiscovery(channel, object : WifiP2pManager.ActionListener {
            override fun onSuccess() {
                // Discovery stopped
            }

            override fun onFailure(reason: Int) {
                // Stopping discovery failed
            }
        })
    }
}