package com.example.bepolite.ui.viewmodels

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.bepolite.core.network.SpeedTestManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SpeedTestViewModel @Inject constructor(private val speedTestManager: SpeedTestManager) : ViewModel() {

    private val _speed = MutableLiveData<Double>()
    val speed: LiveData<Double> = _speed

    fun runSpeedTest() {
        viewModelScope.launch {
            // TODO: Get host and port from selected provider
            val result = speedTestManager.runTcpThroughputTest("host", 1234)
            _speed.postValue(result)
        }
    }
}