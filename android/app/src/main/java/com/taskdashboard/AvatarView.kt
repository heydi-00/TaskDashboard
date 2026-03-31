package com.taskdashboard

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.view.View

class AvatarView(context: Context) : View(context) {

    private var initials: String = "?"
    private var bgColor: Int = Color.GRAY

    private val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.WHITE
        textAlign = Paint.Align.CENTER
        isFakeBoldText = true
    }

    fun setName(name: String) {
        initials = getInitials(name)
        bgColor = generateColor(name)
        bgPaint.color = bgColor
        invalidate()
    }

    private fun getInitials(name: String): String {
        val parts = name.trim().split(" ")
        return when {
            parts.size >= 2 -> "${parts[0].first()}${parts[1].first()}".uppercase()
            parts.size == 1 && parts[0].isNotEmpty() -> parts[0].first().uppercase()
            else -> "?"
        }
    }

    private fun generateColor(name: String): Int {
        val colors = listOf(
            "#F44336", "#E91E63", "#9C27B0", "#673AB7",
            "#3F51B5", "#2196F3", "#009688", "#4CAF50",
            "#FF5722", "#795548"
        )
        val index = Math.abs(name.hashCode()) % colors.size
        return Color.parseColor(colors[index])
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val cx = width / 2f
        val cy = height / 2f
        val radius = minOf(cx, cy)

        // Círculo de fondo
        canvas.drawCircle(cx, cy, radius, bgPaint)

        // Texto de iniciales
        textPaint.textSize = radius * 0.7f
        canvas.drawText(initials, cx, cy - (textPaint.descent() + textPaint.ascent()) / 2, textPaint)
    }
}