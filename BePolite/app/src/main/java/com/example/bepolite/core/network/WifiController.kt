package com.example.bepolite.core.network

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.wifi.ScanResult
import android.net.wifi.WifiManager
import android.net.wifi.WifiNetworkSpecifier
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.os.Build
import androidx.annotation.RequiresApi
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject

class WifiController @Inject constructor(@ApplicationContext private val context: Context) {

    private val wifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager

    private val _scanResults = MutableLiveData<List<ScanResult>>()
    val scanResults: LiveData<List<ScanResult>> = _scanResults

    private val wifiScanReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val success = intent.getBooleanExtra(WifiManager.EXTRA_RESULTS_UPDATED, false)
            if (success) {
                _scanResults.postValue(wifiManager.scanResults)
            }
        }
    }

    fun startScan() {
        val intentFilter = IntentFilter()
        intentFilter.addAction(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION)
        context.registerReceiver(wifiScanReceiver, intentFilter)
        wifiManager.startScan()
    }

    fun stopScan() {
        context.unregisterReceiver(wifiScanReceiver)
    }

    @RequiresApi(Build.VERSION_CODES.Q)
    fun connectToHotspot(scanResult: ScanResult, password: String) {
        val specifier = WifiNetworkSpecifier.Builder()
            .setSsid(scanResult.SSID)
            .setWpa2Passphrase(password)
            .build()

        val request = NetworkRequest.Builder()
            .addTransportType(NetworkCapabilities.TRANSPORT_WIFI)
            .setNetworkSpecifier(specifier)
            .build()

        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as android.net.ConnectivityManager
        connectivityManager.requestNetwork(request, object : android.net.ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                super.onAvailable(network)
                // TODO: Handle successful connection
            }

            override fun onUnavailable() {
                super.onUnavailable()
                // TODO: Handle connection failure
            }
        })
    }
}