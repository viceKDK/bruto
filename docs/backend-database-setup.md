# Backend con Base de Datos SQLite

## ✅ Implementación Completa

El proyecto ahora cuenta con un **backend real** con base de datos SQLite persistente.

## 📁 Estructura del Backend

```
backend/
├── src/
│   ├── server.ts                 # Servidor Express principal
│   ├── database/
│   │   ├── connection.ts         # Conexión a SQLite
│   │   └── migrate.ts            # Sistema de migraciones
│   ├── routes/
│   │   ├── auth.ts               # Endpoints de autenticación
│   │   └── brutos.ts             # Endpoints de Brutos
│   └── middleware/
│       └── auth.ts               # Autenticación JWT
├── database/
│   └── bruto.db                  # Base de datos SQLite (generada automáticamente)
├── package.json
├── tsconfig.json
└── .env
```

## 🗄️ Base de Datos

### Tablas Creadas:

1. **users** - Usuarios del juego
   - id, name, email, password (hash bcrypt)
   - created_at, updated_at

2. **brutos** - Personajes Bruto
   - id, user_id, name, level, xp, wins, losses
   - strength, agility, speed, hp
   - appearance (JSON)
   - created_at, updated_at

3. **daily_fights** - Límite de peleas diarias
   - id, user_id, date, fights_count

4. **battles** - Historial de batallas
   - id, bruto1_id, bruto2_id, winner_id
   - turn_count, battle_log (JSON)
   - created_at

## 🔌 API Endpoints

### Autenticación

- **POST** `/api/auth/register`
  ```json
  {
    "name": "Vicente",
    "email": "admin@system.com",
    "password": "123456"
  }
  ```

- **POST** `/api/auth/login`
  ```json
  {
    "email": "admin@system.com",
    "password": "123456"
  }
  ```

### Brutos

- **GET** `/api/brutos` - Obtener todos los brutos del usuario (requiere auth)
- **GET** `/api/brutos/:id` - Obtener un bruto específico
- **POST** `/api/brutos` - Crear nuevo bruto
  ```json
  {
    "name": "Brutus",
    "strength": 10,
    "agility": 8,
    "speed": 7,
    "hp": 100,
    "appearance": {
      "appearanceId": 1,
      "colorVariant": 2
    }
  }
  ```
- **PUT** `/api/brutos/:id` - Actualizar bruto (stats, wins, losses)
- **POST** `/api/brutos/check-name` - Verificar disponibilidad de nombre

### Batallas

⚡ **Límite de historial: Solo se guardan las últimas 7 batallas por Bruto**

- **POST** `/api/battles` - Guardar batalla (auto-limpia batallas antiguas)
  ```json
  {
    "bruto1_id": "uuid-1",
    "bruto2_id": "uuid-2",
    "winner_id": "uuid-1",
    "turn_count": 15,
    "battle_log": { "turns": [...] }
  }
  ```
- **GET** `/api/battles/bruto/:brutoId` - Obtener últimas 7 batallas de un bruto
- **GET** `/api/battles/bruto/:brutoId/count` - Obtener cantidad de batallas guardadas

## 🔑 Autenticación

- Sistema JWT (JSON Web Tokens)
- Token válido por 30 días
- Headers: `Authorization: Bearer <token>`
- Token guardado en localStorage del navegador

## 🚀 Cómo Iniciar

### Opción 1: Iniciar Frontend y Backend juntos (Recomendado)

```bash
npm run dev
```

Esto inicia:
- Frontend: http://localhost:5174
- Backend: http://localhost:3001

### Opción 2: Iniciar por separado

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend (en otra terminal):**
```bash
npm run dev:frontend
```

## 📝 Variables de Entorno

### Backend (`backend/.env`):
```env
PORT=3001
NODE_ENV=development
DATABASE_PATH=./database/bruto.db
JWT_SECRET=your-secret-key-change-this-in-production
```

### Frontend (`.env`):
```env
VITE_API_URL=http://localhost:3001/api
```

## 🔄 Migraciones

Las migraciones se ejecutan automáticamente al iniciar el servidor.

Para ejecutar manualmente:
```bash
cd backend
npm run migrate
```

## 📊 Estado Actual

✅ Base de datos SQLite con persistencia real
✅ Sistema de usuarios con email + password
✅ Creación y almacenamiento de Brutos
✅ Autenticación JWT
✅ API REST completa
✅ Frontend actualizado para usar API
✅ CORS configurado
✅ Migraciones automáticas
✅ **Sistema de batallas con límite de 7 peleas por Bruto**
✅ **Auto-limpieza de batallas antiguas para optimizar BD**

## 🎮 Flujo de Usuario

1. **Registro/Login** → Recibe JWT token
2. **Crear Bruto** → Se guarda en SQLite con appearance
3. **Seleccionar Bruto** → Carga desde base de datos
4. **Peleas** → Se registran en tabla battles
5. **Stats** → Se actualizan en tabla brutos

## 🔧 Próximos Pasos Posibles

- [ ] Agregar endpoints para batallas
- [ ] Sistema de ranking
- [ ] Tabla de líderes
- [ ] Historial de batallas del usuario
- [ ] Sistema de niveles y experiencia
- [ ] Rewards y monedas

## 📦 Dependencias Backend

- **express** - Servidor web
- **better-sqlite3** - Base de datos SQLite
- **bcrypt** - Hash de contraseñas
- **jsonwebtoken** - Autenticación JWT
- **cors** - CORS para frontend
- **dotenv** - Variables de entorno
- **tsx** - Ejecución TypeScript en desarrollo
