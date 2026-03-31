package com.taskdashboard

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Environment
import android.provider.MediaStore
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.PermissionAwareActivity
import com.facebook.react.modules.core.PermissionListener
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

class CameraModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var pendingPromise: Promise? = null
    private var photoUri: Uri? = null
    private var photoFile: File? = null

    companion object {
        private const val REQUEST_CAMERA_PERMISSION = 1001
        private const val REQUEST_IMAGE_CAPTURE = 1002
    }

    override fun getName(): String = "CameraModule"

    private val activityEventListener = object : BaseActivityEventListener() {
        override fun onActivityResult(
            activity: Activity,
            requestCode: Int,
            resultCode: Int,
            data: Intent?
        ) {
            if (requestCode == REQUEST_IMAGE_CAPTURE) {
                if (resultCode == Activity.RESULT_OK) {
                    val file = photoFile
                    if (file != null) {
                        val result = Arguments.createMap().apply {
                            putString("uri", file.absolutePath)
                            putString("fileName", file.name)
                            putDouble("size", file.length().toDouble())
                        }
                        pendingPromise?.resolve(result)
                    } else {
                        pendingPromise?.reject("ERROR", "No se pudo obtener la foto")
                    }
                } else {
                    pendingPromise?.resolve(null)
                }
                pendingPromise = null
                photoFile = null
                photoUri = null
            }
        }
    }

    init {
        reactContext.addActivityEventListener(activityEventListener)
    }

    @ReactMethod
    fun takePhoto(promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("ERROR", "Activity no disponible")
            return
        }

        if (ContextCompat.checkSelfPermission(
                reactContext,
                Manifest.permission.CAMERA
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            pendingPromise = promise
            val permissionListener = PermissionListener { requestCode, _, grantResults ->
                if (requestCode == REQUEST_CAMERA_PERMISSION) {
                    if (grantResults.isNotEmpty() &&
                        grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                        pendingPromise?.let { launchCamera(it) }
                    } else {
                        pendingPromise?.reject("PERMISSION_DENIED", "Permiso de cámara denegado")
                        pendingPromise = null
                    }
                    true
                } else false
            }
            (activity as? PermissionAwareActivity)?.requestPermissions(
                arrayOf(Manifest.permission.CAMERA),
                REQUEST_CAMERA_PERMISSION,
                permissionListener
            )
            return
        }

        launchCamera(promise)
    }

    private fun launchCamera(promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("ERROR", "Activity no disponible")
            return
        }

        try {
            val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
            val storageDir = reactContext.getExternalFilesDir(Environment.DIRECTORY_PICTURES)
            val file = File.createTempFile("PHOTO_${timeStamp}_", ".jpg", storageDir)
            photoFile = file

            val uri = FileProvider.getUriForFile(
                reactContext,
                "${reactContext.packageName}.provider",
                file
            )
            photoUri = uri
            pendingPromise = promise

            val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE).apply {
                putExtra(MediaStore.EXTRA_OUTPUT, uri)
            }
            activity.startActivityForResult(intent, REQUEST_IMAGE_CAPTURE)
        } catch (e: Exception) {
            promise.reject("ERROR", "Error al abrir cámara: ${e.message}")
        }
    }
}