package com.callrejector

import android.app.Activity
import android.app.role.RoleManager
import android.content.Context
import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.*

class CallScreeningModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var rolePromise: Promise? = null

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String {
        return "CallScreening"
    }

    @ReactMethod
    fun toggleRejection(enabled: Boolean) {
        val sharedPref = reactApplicationContext.getSharedPreferences("CallRejectorPrefs", Context.MODE_PRIVATE)
        with(sharedPref.edit()) {
            putBoolean("rejectionEnabled", enabled)
            apply()
        }
    }

    @ReactMethod
    fun isRejectionEnabled(promise: Promise) {
        val sharedPref = reactApplicationContext.getSharedPreferences("CallRejectorPrefs", Context.MODE_PRIVATE)
        promise.resolve(sharedPref.getBoolean("rejectionEnabled", false))
    }

    @ReactMethod
    fun toggleRejectNonContacts(enabled: Boolean) {
        val sharedPref = reactApplicationContext.getSharedPreferences("CallRejectorPrefs", Context.MODE_PRIVATE)
        with(sharedPref.edit()) {
            putBoolean("rejectNonContactsEnabled", enabled)
            apply()
        }
    }

    @ReactMethod
    fun isRejectNonContactsEnabled(promise: Promise) {
        val sharedPref = reactApplicationContext.getSharedPreferences("CallRejectorPrefs", Context.MODE_PRIVATE)
        promise.resolve(sharedPref.getBoolean("rejectNonContactsEnabled", false))
    }

    @ReactMethod
    fun requestRole(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val roleManager = reactApplicationContext.getSystemService(Context.ROLE_SERVICE) as RoleManager
            if (roleManager.isRoleHeld(RoleManager.ROLE_CALL_SCREENING)) {
                promise.resolve(true)
                return
            }
            rolePromise = promise
            val intent = roleManager.createRequestRoleIntent(RoleManager.ROLE_CALL_SCREENING)
            currentActivity?.startActivityForResult(intent, ROLE_REQUEST_CODE)
        } else {
            promise.reject("API_NOT_SUPPORTED", "Call Screening Role is only supported on Android 10+")
        }
    }

    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == ROLE_REQUEST_CODE) {
            if (resultCode == Activity.RESULT_OK) {
                rolePromise?.resolve(true)
            } else {
                rolePromise?.resolve(false)
            }
            rolePromise = null
        }
    }

    override fun onNewIntent(intent: Intent?) {}

    companion object {
        private const val ROLE_REQUEST_CODE = 1234
    }
}
