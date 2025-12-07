package com.example.bepolite.core.network

import android.net.TrafficStats
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import javax.inject.Inject

class UsageLimiter @Inject constructor() {

    private val _usageExceeded = MutableLiveData<Boolean>()
    val usageExceeded: LiveData<Boolean> = _usageExceeded

    private var usageLimitBytes = 0L
    private var monitoring = false

    fun startMonitoring(limitMb: Long) {
        usageLimitBytes = limitMb * 1024 * 1024
        monitoring = true
        CoroutineScope(Dispatchers.IO).launch {
            val startBytes = TrafficStats.getMobileTxBytes()
            while (monitoring) {
                val currentBytes = TrafficStats.getMobileTxBytes()
                if (currentBytes - startBytes > usageLimitBytes) {
                    _usageExceeded.postValue(true)
                    stopMonitoring()
                }
                delay(1000)
            }
        }
    }

    fun stopMonitoring() {
        monitoring = false
    }
}