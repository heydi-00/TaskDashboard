# 📋 TaskDashboard — Dashboard de Tareas Colaborativas

Aplicación móvil Android desarrollada con React Native CLI y TypeScript, con arquitectura **offline-first** usando WatermelonDB.

---

## 🚀 Tecnologías utilizadas

- **Framework:** React Native CLI 0.84.1
- **Lenguaje:** TypeScript (tipado estricto)
- **Base de datos local:** WatermelonDB (SQLite)
- **Manejo de estado:** Zustand
- **Navegación:** React Navigation
- **API Externa:** [dummyjson.com/todos](https://dummyjson.com/todos)

---

## 📁 Estructura del proyecto
```
TaskDashboard/
├── src/
│   ├── api/              # Servicios de API externa
│   │   └── taskService.ts
│   ├── database/         # Configuración WatermelonDB
│   │   ├── models/
│   │   │   └── Task.ts
│   │   ├── schema.ts
│   │   └── index.ts
│   ├── store/            # Estado global con Zustand
│   │   └── taskStore.ts
│   ├── screens/          # Pantallas de la app
│   │   └── DashboardScreen.tsx
│   ├── components/       # Componentes reutilizables
│   │   ├── TaskItem.tsx
│   │   └── AvatarView.tsx
│   └── types/            # Tipos TypeScript
│       └── index.ts
├── android/
│   └── app/src/main/java/com/taskdashboard/
│       ├── AvatarView.kt          # Vista nativa circular
│       ├── AvatarViewManager.kt   # Manager del componente nativo
│       ├── AvatarViewPackage.kt   # Package del componente nativo
│       ├── CameraModule.kt        # Módulo nativo de cámara
│       └── CameraPackage.kt       # Package del módulo de cámara
└── App.tsx
```

---

## ⚙️ Requisitos previos

- Node.js v18 o superior
- JDK 17
- Android Studio con SDK Android 14 (API 34)
- React Native CLI

---

## 🛠️ Instalación y ejecución

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/TaskDashboard.git
cd TaskDashboard
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el emulador

Abre Android Studio y lanza un emulador Android (Pixel 7, API 34).

### 4. Ejecutar la app
```bash
npx react-native run-android
```

---

## 🏗️ Arquitectura Offline-First

La app implementa un patrón **offline-first** con WatermelonDB:

### ¿Por qué WatermelonDB?

- Está construido sobre SQLite, lo que garantiza persistencia real en el dispositivo
- Tiene excelente rendimiento con grandes volúmenes de datos gracias a su arquitectura lazy
- Soporta operaciones en batch para sincronización eficiente
- Se integra nativamente con React Native sin puentes adicionales

### Flujo de datos
```
Primera apertura:
API (dummyjson.com) → WatermelonDB (SQLite local) → UI

Uso normal (con o sin internet):
WatermelonDB (SQLite local) → UI

Pull-to-refresh:
API → WatermelonDB (actualiza) → UI

Modificaciones offline:
UI → WatermelonDB (guarda localmente) → UI actualizada
```

### Ventajas del enfoque

- La UI **nunca** lee directamente de la API
- Los cambios (completar tareas, adjuntar fotos) se guardan localmente
- Funciona completamente **sin conexión a internet**
- El Pull-to-Refresh sincroniza cuando hay conexión

---

## 🌟 Componente Nativo: AvatarView

Componente de UI nativo desarrollado en **Kotlin** para Android.

### Funcionalidad

- Recibe una propiedad `name` desde React Native
- Extrae las iniciales del nombre (ej: "Santiago Lopez" → "SL")
- Genera un color de fondo único basado en el hash del nombre
- Renderiza una vista circular nativa con las iniciales centradas

### Implementación

- `AvatarView.kt` — Vista nativa que extiende `View`
- `AvatarViewManager.kt` — `SimpleViewManager` que expone la vista a React Native
- `AvatarViewPackage.kt` — Package que registra el módulo

---

## 📷 Módulo Nativo: CameraModule (Opcional)

Módulo nativo en **Kotlin** que permite tomar fotos y vincularlas a tareas.

### Funcionalidad

- Abre la cámara nativa del dispositivo
- Guarda la foto en el directorio persistente de la app
- Retorna la URI del archivo a React Native
- Maneja cancelación sin crashear
- Persiste la referencia en WatermelonDB (campo `attachmentUri`)

---

## 🤖 Uso de IA

Durante el desarrollo de este proyecto se utilizó **Claude (Anthropic)** como asistente principal.

### Herramientas utilizadas

- **Claude (claude.ai)** — Asistente principal de desarrollo

### ¿Para qué tareas?

- Generación de la estructura inicial del proyecto
- Implementación del schema y modelos de WatermelonDB
- Configuración del store con Zustand
- Creación de componentes de UI (TaskItem, DashboardScreen)
- Implementación del código Kotlin para AvatarView y CameraModule
- Resolución de errores de compilación y compatibilidad

### Supervisión humana

La supervisión fue clave en cada paso del proceso:

- **Verificación del entorno:** Configuración manual de variables de entorno, JDK y Android Studio
- **Revisión de código:** Cada archivo generado fue revisado antes de ser integrado
- **Depuración:** Los errores de compilación fueron analizados y corregidos iterativamente
- **Decisiones de arquitectura:** La elección de WatermelonDB, Zustand y la estructura de carpetas fue validada contra los requisitos de la prueba
- **Pruebas funcionales:** Verificación manual en emulador de cada funcionalidad implementada

---

## ✅ Funcionalidades implementadas

- [x] Sincronización inicial desde API externa
- [x] Lectura exclusiva desde base de datos local
- [x] Modificaciones offline (completar/pendiente)
- [x] Pull-to-refresh para sincronizar
- [x] Filtros: Todas, Completadas, Pendientes
- [x] Feedback visual inmediato
- [x] Componente nativo AvatarView (Kotlin)
- [x] Módulo nativo CameraModule (Kotlin)
- [x] Adjuntar foto a tareas
- [x] Persistencia offline-first de fotos

