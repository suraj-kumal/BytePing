# BytePing

BytePing is a full-stack project with a Django backend and a Next.js frontend.

- Backend: Django app located under the [byteping](byteping) package. Core settings: [`byteping.settings`](byteping/settings.py). Run entry: [manage.py](manage.py). Database: [db.sqlite3](db.sqlite3).
- Frontend: Next.js app in [byteping-frontend](byteping-frontend). Frontend config: [byteping-frontend/package.json](byteping-frontend/package.json) and [byteping-frontend/next.config.ts](byteping-frontend/next.config.ts).

Repository highlights

- Authentication app (Django): [`authentication.models`](authentication/models.py), [`authentication.serializers`](authentication/serializers.py), [`authentication.views`](authentication/views.py), tests: [`authentication.tests`](authentication/tests.py). See files: [authentication/models.py](authentication/models.py), [authentication/views.py](authentication/views.py), [authentication/serializers.py](authentication/serializers.py), [authentication/tests.py](authentication/tests.py).
- Project config: [byteping/settings.py](byteping/settings.py), [byteping/urls.py](byteping/urls.py), [byteping/wsgi.py](byteping/wsgi.py), [byteping/asgi.py](byteping/asgi.py).
- Environment vars: [.env](.env)
- Requirements: [requirements.txt](requirements.txt)

Quickstart — Backend (Django)

1. Create and activate a virtual environment:
   - macOS / Linux:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```
   - Windows (PowerShell):
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure environment:
   - Copy and edit [.env](.env) (already present in repo). Ensure `SECRET_KEY`, `DEBUG`, `EMAIL_*`, `FRONTEND_URL`, `BACKEND_URL` are set.
4. Apply migrations and create a superuser:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```
5. Run the development server:
   ```bash
   python manage.py runserver
   ```
6. Useful files:
   - Project entry: [manage.py](manage.py)
   - Settings: [`byteping.settings`](byteping/settings.py)
   - URLs: [`byteping.urls`](byteping/urls.py)

Running backend tests

```bash
python manage.py test
# or run specific app tests
python manage.py test authentication
```

See tests at [authentication/tests.py](authentication/tests.py).

Quickstart — Frontend (Next.js)

1. Install packages (pnpm recommended since lockfile present):
   ```bash
   cd byteping-frontend
   pnpm install
   ```
   Or with npm:
   ```bash
   npm install
   ```
2. Run dev server:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```
3. Config and entry files:
   - [byteping-frontend/package.json](byteping-frontend/package.json)
   - [byteping-frontend/next.config.ts](byteping-frontend/next.config.ts)

Project layout (partial)

- [manage.py](manage.py)
- [byteping/settings.py](byteping/settings.py)
- [authentication/models.py](authentication/models.py)
- [authentication/serializers.py](authentication/serializers.py)
- [authentication/views.py](authentication/views.py)
- [authentication/tests.py](authentication/tests.py)
- [byteping-frontend/package.json](byteping-frontend/package.json)
- [.env](.env)
- [requirements.txt](requirements.txt)
- [db.sqlite3](db.sqlite3)

Notes & tips

- Keep `.env` out of version control (already present locally). Do not commit secrets.
- If you change models, run `python manage.py makemigrations` then `migrate`.
- Use the Django admin (create a superuser) to inspect models.

If you want, I can:

- Add a CONTRIBUTING.md with development guidelines.
- Add Dockerfiles for both backend and frontend.
- Generate example API docs for authentication endpoints found in [`authentication.views`](authentication/views.py).

````// filepath: README.md
# BytePing

BytePing is a full-stack project with a Django backend and a Next.js frontend.

- Backend: Django app located under the [byteping](byteping) package. Core settings: [`byteping.settings`](byteping/settings.py). Run entry: [manage.py](manage.py). Database: [db.sqlite3](db.sqlite3).
- Frontend: Next.js app in [byteping-frontend](byteping-frontend). Frontend config: [byteping-frontend/package.json](byteping-frontend/package.json) and [byteping-frontend/next.config.ts](byteping-frontend/next.config.ts).

Repository highlights
- Authentication app (Django): [`authentication.models`](authentication/models.py), [`authentication.serializers`](authentication/serializers.py), [`authentication.views`](authentication/views.py), tests: [`authentication.tests`](authentication/tests.py). See files: [authentication/models.py](authentication/models.py), [authentication/views.py](authentication/views.py), [authentication/serializers.py](authentication/serializers.py), [authentication/tests.py](authentication/tests.py).
- Project config: [byteping/settings.py](byteping/settings.py), [byteping/urls.py](byteping/urls.py), [byteping/wsgi.py](byteping/wsgi.py), [byteping/asgi.py](byteping/asgi.py).
- Environment vars: [.env](.env)
- Requirements: [requirements.txt](requirements.txt)

Quickstart — Backend (Django)
1. Create and activate a virtual environment:
   - macOS / Linux:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```
   - Windows (PowerShell):
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
````

3. Configure environment:
   - Copy and edit [.env](.env) (already present in repo). Ensure `SECRET_KEY`, `DEBUG`, `EMAIL_*`, `FRONTEND_URL`, `BACKEND_URL` are set.
4. Apply migrations and create a superuser:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```
5. Run the development server:
   ```bash
   python manage.py runserver
   ```
6. Useful files:
   - Project entry: [manage.py](manage.py)
   - Settings: [`byteping.settings`](byteping/settings.py)
   - URLs: [`byteping.urls`](byteping/urls.py)

Running backend tests

```bash
python manage.py test
# or run specific app tests
python manage.py test authentication
```

See tests at [authentication/tests.py](authentication/tests.py).

Quickstart — Frontend (Next.js)

1. Install packages (pnpm recommended since lockfile present):
   ```bash
   cd byteping-frontend
   pnpm install
   ```
   Or with npm:
   ```bash
   npm install
   ```
2. Run dev server:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```
3. Config and entry files:
   - [byteping-frontend/package.json](byteping-frontend/package.json)
   - [byteping-frontend/next.config.ts](byteping-frontend/next.config.ts)

Project layout (partial)

- [manage.py](manage.py)
- [byteping/settings.py](byteping/settings.py)
- [authentication/models.py](authentication/models.py)
- [authentication/serializers.py](authentication/serializers.py)
- [authentication/views.py](authentication/views.py)
- [authentication/tests.py](authentication/tests.py)
- [byteping-frontend/package.json](byteping-frontend/package.json)
- [.env](.env)
- [requirements.txt](requirements.txt)
- [db.sqlite3](db.sqlite3)

