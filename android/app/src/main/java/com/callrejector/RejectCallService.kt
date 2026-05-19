package com.callrejector

import android.telecom.Call
import android.telecom.CallScreeningService
import android.content.Context
import android.net.Uri
import android.provider.ContactsContract
import android.Manifest
import android.content.pm.PackageManager

class RejectCallService : CallScreeningService() {
    override fun onScreenCall(callDetails: Call.Details) {
        val sharedPref = getSharedPreferences("CallRejectorPrefs", Context.MODE_PRIVATE)
        val isEnabled = sharedPref.getBoolean("rejectionEnabled", false)
        val rejectNonContactsEnabled = sharedPref.getBoolean("rejectNonContactsEnabled", false)

        var shouldReject = isEnabled

        if (!shouldReject && rejectNonContactsEnabled) {
            val handle = callDetails.handle
            if (handle != null) {
                val phoneNumber = handle.schemeSpecificPart
                if (!isContact(phoneNumber)) {
                    shouldReject = true
                }
            }
        }

        if (shouldReject) {
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

    private fun isContact(phoneNumber: String): Boolean {
        if (checkSelfPermission(Manifest.permission.READ_CONTACTS) != PackageManager.PERMISSION_GRANTED) {
            return false // If permission is missing, act as if it's not a contact
        }

        val uri = Uri.withAppendedPath(ContactsContract.PhoneLookup.CONTENT_FILTER_URI, Uri.encode(phoneNumber))
        val projection = arrayOf(ContactsContract.PhoneLookup._ID)
        
        contentResolver.query(uri, projection, null, null, null)?.use { cursor ->
            if (cursor.moveToFirst()) {
                return true
            }
        }
        return false
    }
}
