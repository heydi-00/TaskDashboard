package com.taskdashboard

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class AvatarViewManager : SimpleViewManager<AvatarView>() {

    override fun getName(): String = "AvatarView"

    override fun createViewInstance(context: ThemedReactContext): AvatarView {
        return AvatarView(context)
    }

    @ReactProp(name = "name")
    fun setName(view: AvatarView, name: String?) {
        view.setName(name ?: "")
    }
}