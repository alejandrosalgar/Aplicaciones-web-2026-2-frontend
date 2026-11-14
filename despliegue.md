# Despliegue del frontend en Firebase Hosting

Guía para publicar este Angular en Firebase y dejar el CD listo: cada push a `main` construye el proyecto y lo sube solo.

Todo se hace en la carpeta de este repositorio, donde están `package.json` y `angular.json`. El backend no se despliega aquí.

La carpeta pública que hay que indicarle a Firebase es:

```text
dist/APLICACIONES-WEB-2026-2/browser
```

Esa ruta la produce `npm run build` en este proyecto. No uses `public` ni `dist` a secas.

Antes de construir para producción, la URL de la API en `src/environments/environment.ts` tiene que ser la del backend publicado. Si sigue en `127.0.0.1` o `127.0.0.2`, el sitio abre en internet y las peticiones salen hacia la máquina de quien lo abrió.

---

## 0. Qué tiene que estar instalado

En la terminal:

```bash
node -v
npm -v
git --version
```

Angular 21 de este repo pide Node `20.19` o superior, o Node `22.12` o superior. Si `node -v` queda por debajo, instala la versión LTS actual desde [https://nodejs.org](https://nodejs.org) y vuelve a abrir la terminal.

El repositorio del frontend ya tiene que existir en GitHub, en la rama `main`.

---

## 1. Cuenta y proyecto en la página de Firebase

Esto se hace en el navegador, sin comandos.

1. Abre [https://console.firebase.google.com](https://console.firebase.google.com).
2. Entra con una cuenta de Google. Si no tienes, créala en esa misma pantalla.
3. Pulsa **Crear un proyecto** (o **Add project**).
4. **Nombre del proyecto:** un nombre corto, por ejemplo `aplicaciones-web-2026-2`. Firebase arma el ID a partir de ese nombre. Anótalo: es el que usa la consola y la URL del sitio (`https://ESE-ID.web.app`).
5. **Google Analytics:** desactívalo. Para este hosting no hace falta.
6. Pulsa **Crear proyecto** y espera a que termine. Entra al proyecto.
7. En el menú izquierdo abre **Compilación** y luego **Hosting** (en inglés: **Build** → **Hosting**).
8. Pulsa **Comenzar** / **Get started**. Si pide registrar una app o saltar el asistente, ciérralo: el sitio se configura desde la terminal en el paso 4. Con dejar Hosting abierto en el proyecto basta.

No crees otra app web a mano ni pegues el snippet de Firebase en Angular. Este despliegue solo usa Hosting.

---

## 2. Instalar la CLI

En cualquier carpeta:

```bash
npm install -g firebase-tools
firebase --version
```

Tiene que imprimir un número de versión. Si Windows dice que `firebase` no se reconoce, cierra la terminal, ábrela de nuevo y repite `firebase --version`.

---

## 3. Entrar a la cuenta desde la consola

```bash
firebase login
```

Se abre el navegador. Elige la misma cuenta de Google del paso 1 y acepta el permiso. La terminal queda en `Success! Logged in as ...`.

Para comprobar:

```bash
firebase projects:list
```

El proyecto creado en el paso 1 tiene que aparecer en la lista.

---

## 4. Construir una vez, antes del init

Desde la raíz de este frontend:

```bash
npm install
npm run build
```

Al terminar existe `dist/APLICACIONES-WEB-2026-2/browser/index.html`. Hace falta que ese archivo ya esté, para no dejar que Firebase lo reemplace por una página de ejemplo.

---

## 5. `firebase init hosting`

Sigue en la raíz del frontend:

```bash
firebase init hosting
```

Responde así. El texto de la pregunta puede salir en inglés.

| Pregunta | Qué poner |
| --- | --- |
| Please select an option | **Use an existing project** |
| Select a default Firebase project for this directory | El proyecto del paso 1 |
| What do you want to use as your public directory? | `dist/APLICACIONES-WEB-2026-2/browser` |
| Configure as a single-page app (rewrite all urls to /index.html)? | **Yes** |
| Set up automatic builds and deploys with GitHub? | **Yes** |
| File dist/APLICACIONES-WEB-2026-2/browser/index.html already exists. Overwrite? | **No** |

**Yes** en la aplicación de una sola página hace que rutas como `/Empleados` sigan abriendo Angular al recargar. **No** en overwrite conserva el `index.html` del build.

A partir de aquí la CLI configura el CD. Se abre GitHub para autorizar la app de Firebase. Acepta el acceso y elige este repositorio.

| Pregunta | Qué poner |
| --- | --- |
| For which GitHub repository would you like to set up a GitHub workflow? | `usuario/nombre-del-repo`, el de este frontend |
| Set up the workflow to run a build script before every deploy? | **Yes** |
| What script should be run before every deploy? | `npm ci && npm run build` |
| Set up automatic deployment to your site's live channel when a PR is merged? | **Yes** |
| What is the name of the GitHub branch associated with your site's live channel? | `main` |
| Set up automatic deployment of preview channels for pull requests? | **No** |

La CLI crea una cuenta de servicio en el proyecto de Firebase y guarda la clave como secreto del repositorio en GitHub. El nombre del secreto es `FIREBASE_SERVICE_ACCOUNT_` seguido del ID del proyecto, en mayúsculas y con guiones bajos.

Al terminar, en el repo quedan estos archivos nuevos:

```text
firebase.json
.firebaserc
.github/workflows/firebase-hosting-merge.yml
```

`firebase.json` tiene que verse así, con el ID real en lugar del ejemplo solo dentro de `.firebaserc`:

```json
{
  "hosting": {
    "public": "dist/APLICACIONES-WEB-2026-2/browser",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

`.firebaserc` apunta al proyecto:

```json
{
  "projects": {
    "default": "el-id-del-proyecto"
  }
}
```

Si la carpeta pública no coincide con `dist/APLICACIONES-WEB-2026-2/browser`, cámbiala a mano en `firebase.json` antes de subir nada.

---

## 6. Primer despliegue manual

Sirve para comprobar Hosting antes de confiar en el CD.

```bash
npm run build
firebase deploy --only hosting
```

La terminal imprime la URL, de esta forma:

```text
https://el-id-del-proyecto.web.app
```

Ábrela. Tiene que cargar la app, no la página de bienvenida de Firebase. Recarga una ruta interna, por ejemplo `/Empleados`: tiene que seguir en la app.

En la consola web, **Hosting** muestra ese mismo sitio como canal en vivo.

---

## 7. Dejar el CD listo

El workflow ya lo escribió el init. Falta subirlo a `main` para que GitHub Actions lo ejecute.

Revisa que el YAML de merge haga estas tres cosas:

- se dispara con `push` a la rama `main`;
- corre `npm ci && npm run build`;
- despliega con `FirebaseExtended/action-hosting-deploy` al canal `live`, usando el secreto de la cuenta de servicio y el `projectId` de tu proyecto.

Luego:

```bash
git add firebase.json .firebaserc .github/workflows/firebase-hosting-merge.yml
git commit -m "Configura Firebase Hosting y el despliegue en main"
git push origin main
```

`dist/` no se sube. Ya está en `.gitignore`. El CD construye esa carpeta en GitHub.

En GitHub abre **Actions**. El workflow de Firebase Hosting tiene que pasar en verde. Al terminar, la misma URL del paso 6 queda actualizada con ese commit.

Cada push nuevo a `main` repite el ciclo: instala dependencias, ejecuta `npm run build` y publica `dist/APLICACIONES-WEB-2026-2/browser`.

---

## 8. Si el secreto no quedó en GitHub

En el repositorio de GitHub entra a **Settings → Secrets and variables → Actions**. Tiene que existir `FIREBASE_SERVICE_ACCOUNT_...`.

Si el init no lo creó:

1. En Firebase abre **Configuración del proyecto** (engranaje) → **Cuentas de servicio** → **Generar nueva clave privada**. Se descarga un JSON.
2. En GitHub crea el secreto con ese nombre. El valor es el JSON completo, en una sola pieza.
3. Vuelve a hacer push a `main`, o en **Actions** pulsa **Re-run jobs**.

No pegues ese JSON en el repositorio ni en el README.

---

## Comandos, en orden

```bash
node -v
npm -v
npm install -g firebase-tools
firebase login
firebase projects:list
npm install
npm run build
firebase init hosting
firebase deploy --only hosting
git add firebase.json .firebaserc .github/workflows/firebase-hosting-merge.yml
git commit -m "Configura Firebase Hosting y el despliegue en main"
git push origin main
```

Las respuestas del `init` están en el paso 5. El alta del proyecto en la web está en el paso 1.
