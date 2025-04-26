---
title: ToDo API
emoji: 📝
colorFrom: blue
colorTo: green
sdk: docker
license: gpl-3.0
pinned: false
app_port: 5000
---

*The table above contains the configuration for the Huggingface Space. Just ignore it.*

# Simple ToDo API

A simple RESTful API for managing todo items built with Python and Flask.

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set the environment variables:
   - Required:
     - Windows: `set TODO_TOKEN=your_secret_token`
     - Unix/MacOS: `export TODO_TOKEN=your_secret_token`

   - Optional:
     - Windows:
       ```
       set PAGE_TITLE=Your Custom Title
       set SHOW_ADMIN_PANEL_BUTTON=true
       set SERVER_HOST=0.0.0.0
       set SERVER_PORT=5000
       set DEBUG_MODE=false
       ```
     - Unix/MacOS:
       ```
       export PAGE_TITLE="Your Custom Title"
       export SERVER_HOST="0.0.0.0"
       export SERVER_PORT=5000
       export SHOW_ADMIN_PANEL_BUTTON=true
       export DEBUG_MODE=false
       ```

5. Run the application:
   ```
   python app.py
   ```

The API will be available at `http://127.0.0.1:5000`.

## Environment Variables

The application supports the following environment variables:

| Variable                  | Description                                                          | Default Value | Required |
| ------------------------- | -------------------------------------------------------------------- | ------------- | -------- |
| `TODO_TOKEN`              | Authentication token for API access                                  | None          | Yes      |
| `PAGE_TITLE`              | Custom title for the application                                     | "ToDo App"    | No       |
| `SHOW_ADMIN_PANEL_BUTTON` | Whether to show the admin panel button on the home page              | "true"        | No       |
| `DEBUG_MODE`              | Enable Flask debug mode with auto-reloading and detailed error pages | "false"       | No       |

Note: For boolean environment variables like `SHOW_ADMIN_PANEL_BUTTON`, the values "true", "yes", "1", "y" (case-insensitive) are considered true. Any other value is considered false.

## Authentication

The API uses two levels of authentication:

1. **Guest Access (Default Mode)**:
   - Guests can read todos (GET operations) without authentication
   - All write operations (POST, PUT, DELETE) require authentication

2. **Private Mode**:
   - When enabled, all operations (including GET) require authentication
   - This mode can be toggled by authenticated users

Authentication is done using a Bearer token in the Authorization header:

```
Authorization: Bearer your_secret_token
```

The token must match the value set in the `TODO_TOKEN` environment variable.

## Data Persistence

The application stores all data in JSON files located in the `data` directory:

- `todos.json`: Contains all todo items and the next ID counter
- `settings.json`: Contains application settings like private mode status

Data is automatically saved to these files whenever:
- A new todo is created
- A todo is updated
- A todo is deleted
- Private mode is toggled

This ensures that your data persists between application restarts.

The application also includes an automatic file repair mechanism that:
- Detects corrupted or empty JSON files on startup
- Creates new valid files with default values if needed
- Ensures the application can start even if data files are damaged

## Web Interface

The application provides two interfaces:

### Public View (`/`)
- View all todos (read-only)
- Link to admin panel

### Admin Panel (`/admin/`)
- Requires authentication with a valid token
- Add new todos
- Mark todos as completed
- Delete todos
- Toggle Private Mode
- Export todos as JSON file

## API Endpoints

### Get all todos
```
GET /api/todos
```
Requires authentication in private mode.

### Get a specific todo
```
GET /api/todos/<id>
```
Requires authentication in private mode.

### Create a new todo
```
POST /api/todos
```
Requires authentication.

Request body:
```json
{
  "title": "Task title",
  "description": "Task description",
  "completed": false
}
```

### Update a todo
```
PUT /api/todos/<id>
```
Requires authentication.

Request body:
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "completed": true
}
```

### Delete a todo
```
DELETE /api/todos/<id>
```
Requires authentication.

### Get Private Mode status
```
GET /api/private-mode
```
No authentication required.

### Toggle Private Mode
```
POST /api/private-mode
```
Requires authentication.

Request body:
```json
{
  "enabled": true
}
```

### Export Todos as JSON
```
GET /api/todos/export
```
Requires authentication.

Returns a downloadable JSON file containing all todos with additional metadata. The response includes:
- Content-Disposition header for browser download
- Content-Type: application/json
- A JSON object with todos, next_id, exported_at timestamp, and count fields

### Import Todos from JSON
```
POST /api/todos/import
```
Requires authentication.

Imports todos from a JSON file previously exported using the export endpoint. This will replace all existing todos.

Request body:
```json
{
  "todos": {
    "1": {
      "id": 1,
      "title": "Task title",
      "description": "Task description",
      "completed": false,
      "created_at": "2023-01-01T12:00:00",
      "updated_at": "2023-01-01T12:00:00"
    },
    "2": { ... }
  },
  "next_id": 3,
  "exported_at": "2023-01-01T12:00:00",
  "count": 2
}
```

Response:
```json
{
  "message": "Todos imported successfully",
  "imported_count": 2,
  "previous_count": 0
}
```

## Example API Calls

### Reading todos (Guest Access)
```
curl -X GET http://127.0.0.1:5000/api/todos
```

### Reading todos (with Authentication)
```
curl -X GET http://127.0.0.1:5000/api/todos -H "Authorization: Bearer your_secret_token"
```

### Creating a todo (Always requires authentication)
```
curl -X POST http://127.0.0.1:5000/api/todos -H "Content-Type: application/json" -H "Authorization: Bearer your_secret_token" -d '{"title": "New Task"}'
```

### Checking Private Mode status
```
curl -X GET http://127.0.0.1:5000/api/private-mode
```

### Enabling Private Mode
```
curl -X POST http://127.0.0.1:5000/api/private-mode -H "Content-Type: application/json" -H "Authorization: Bearer your_secret_token" -d '{"enabled": true}'
```

### Exporting Todos as JSON
```
curl -X GET http://127.0.0.1:5000/api/todos/export -H "Authorization: Bearer your_secret_token" -o todos_export.json
```

### Importing Todos from JSON
```
curl -X POST http://127.0.0.1:5000/api/todos/import -H "Content-Type: application/json" -H "Authorization: Bearer your_secret_token" -d @todos_export.json
```

### Using PowerShell
```
# Get todos (Guest Access)
Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/todos' -Method Get

# Get todos (with Authentication)
Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/todos' -Method Get -Headers @{Authorization = "Bearer your_secret_token"}

# Check Private Mode status (no authentication required)
Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/private-mode' -Method Get

# Create a todo
$body = @{ title = 'New Task' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/todos' -Method Post -Body $body -ContentType 'application/json' -Headers @{Authorization = "Bearer your_secret_token"}

# Enable Private Mode
$body = @{ enabled = $true } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/private-mode' -Method Post -Body $body -ContentType 'application/json' -Headers @{Authorization = "Bearer your_secret_token"}

# Export Todos as JSON
Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/todos/export' -Method Get -Headers @{Authorization = "Bearer your_secret_token"} -OutFile 'todos_export.json'

# Import Todos from JSON
$importData = Get-Content -Path 'todos_export.json' -Raw
Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/todos/import' -Method Post -Body $importData -ContentType 'application/json' -Headers @{Authorization = "Bearer your_secret_token"}
```

## Docker Support

This project includes Docker support for easy deployment on various platforms. The Dockerfile uses Ubuntu 22.04 as the base image and clones the repository during the build process, ensuring a lightweight and up-to-date deployment.

### Building the Docker Image Locally

```bash
docker build -t todo-api .
```

### Running the Container Locally

```bash
docker run -p 5000:5000 -e TODO_TOKEN=your_secret_token todo-api
```

### Using Environment Variables

You can pass environment variables to customize the application:

```bash
docker run -p 5000:5000 \
  -e TODO_TOKEN=your_secret_token \
  -e PAGE_TITLE="My Custom ToDo App" \
  -e SHOW_ADMIN_PANEL_BUTTON=true \
  -e DEBUG_MODE=false \
  todo-api
```

### Persisting Data

To persist data between container restarts, mount a volume to the `/app/data` directory:

```bash
docker run -p 5000:5000 \
  -e TODO_TOKEN=your_secret_token \
  -v $(pwd)/data:/app/data \
  todo-api
```

## Open Source

This project is open source and available under the [GNU GPLv3 License](LICENSE). Feel free to contribute and improve it!
