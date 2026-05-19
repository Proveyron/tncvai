package com.callrejector

import android.telecom.Call
import android.telecom.CallScreeningService
import android.content.Context

class RejectCallService : CallScreeningService() {
    override fun onScreenCall(callDetails: Call.Details) {
        val sharedPref = getSharedPreferences("CallRejectorPrefs", Context.MODE_PRIVATE)
        val isEnabled = sharedPref.getBoolean("rejectionEnabled", false)

        if (isEnabled) {
            val response = CallResponse.Builder()
                .setDisallowCall(true)
                .setRejectCall(true)
                .setSkipNotification(true)
                .setSkipCallLog(false)
                .build()
            respondToCall(callDetails, response)
        } else {
            respondToCall(callDetails, CallResponse.Builder().build())
        }
    }
}
