import os
import json
from datetime import datetime

# File to store todos
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
TODOS_FILE = os.path.join(DATA_DIR, 'todos.json')  # Match the actual file name case
SETTINGS_FILE = os.path.join(DATA_DIR, 'settings.json')

# Ensure data directory exists
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# In-memory database (will be loaded from file)
todos = {}
next_id = 1

# Private Mode flag - when True, all operations require authentication
private_mode = False

def load_todos():
    """Load todos from file"""
    global todos, next_id

    # Print absolute path for debugging
    abs_path = os.path.abspath(TODOS_FILE)
    print(f"Attempting to load todos from: {abs_path}")

    # Ensure data directory exists
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
        print(f"Created data directory: {DATA_DIR}")

    # Check if file exists
    data_dir_files = os.listdir(DATA_DIR) if os.path.exists(DATA_DIR) else []
    print(f"Files in data directory: {data_dir_files}")

    # Initialize with empty data
    todos = {}
    next_id = 1

    if os.path.exists(TODOS_FILE):
        print(f"File exists check passed for: {TODOS_FILE}")
        try:
            # Check if file is empty
            if os.path.getsize(TODOS_FILE) == 0:
                print(f"File {TODOS_FILE} is empty, initializing with empty data")
                # Create a new empty file with valid JSON structure
                create_empty_todos_file()
                return

            # Try to load the file
            with open(TODOS_FILE, 'r') as f:
                print(f"Successfully opened file for reading")
                try:
                    data = json.load(f)
                    todos_data = data.get('todos', {})
                    next_id = data.get('next_id', 1)

                    print(f"Loaded JSON data: {len(todos_data)} todos, next_id={next_id}")

                    # Convert string keys to integers
                    todos = {}
                    for id_str, todo_data in todos_data.items():
                        todo_id = int(id_str)
                        todo = Todo(
                            title=todo_data['title'],
                            description=todo_data['description'],
                            completed=todo_data['completed'],
                            id=todo_id  # Pass the ID directly to avoid auto-increment
                        )
                        # Set timestamps from the saved data
                        todo.created_at = datetime.fromisoformat(todo_data['created_at'])
                        todo.updated_at = datetime.fromisoformat(todo_data['updated_at'])
                        todos[todo_id] = todo
                        print(f"Loaded todo #{todo_id}: {todo.title}")

                    print(f"Loaded {len(todos)} todos from {TODOS_FILE}")
                except json.JSONDecodeError as e:
                    print(f"JSON decode error in {TODOS_FILE}: {e}")
                    print("File is corrupted, creating a new empty file")
                    create_empty_todos_file()
        except Exception as e:
            print(f"Error loading todos: {e}")
            import traceback
            traceback.print_exc()
            # Create a new empty file with valid JSON structure
            create_empty_todos_file()
    else:
        print(f"Todos file not found at {TODOS_FILE}, creating a new empty file")
        create_empty_todos_file()

def create_empty_todos_file():
    """Create a new empty todos file with valid JSON structure"""
    global todos, next_id

    # Initialize with empty data
    todos = {}
    next_id = 1

    # Create the empty file
    try:
        data = {
            'todos': {},
            'next_id': 1
        }

        with open(TODOS_FILE, 'w') as f:
            json.dump(data, f, indent=2)

        print(f"Created new empty todos file at {TODOS_FILE}")
    except Exception as e:
        print(f"Error creating empty todos file: {e}")
        import traceback
        traceback.print_exc()

def save_todos():
    """Save todos to file"""
    try:
        # Ensure data directory exists
        if not os.path.exists(DATA_DIR):
            os.makedirs(DATA_DIR)
            print(f"Created data directory: {DATA_DIR}")

        # Convert todos to serializable format
        todos_data = {}
        for todo_id, todo in todos.items():
            todos_data[str(todo_id)] = todo.to_dict()
            print(f"Preparing to save todo #{todo_id}: {todo.title}")

        data = {
            'todos': todos_data,
            'next_id': next_id
        }

        # Print absolute path for debugging
        abs_path = os.path.abspath(TODOS_FILE)
        print(f"Attempting to save todos to: {abs_path}")

        with open(TODOS_FILE, 'w') as f:
            json.dump(data, f, indent=2)
            print(f"Successfully wrote JSON data to file")

        print(f"Saved {len(todos)} todos to {TODOS_FILE}")
    except Exception as e:
        print(f"Error saving todos: {e}")
        import traceback
        traceback.print_exc()

def load_settings():
    """Load settings from file"""
    global private_mode

    # Initialize with default settings
    private_mode = False

    if os.path.exists(SETTINGS_FILE):
        try:
            # Check if file is empty
            if os.path.getsize(SETTINGS_FILE) == 0:
                print(f"File {SETTINGS_FILE} is empty, initializing with default settings")
                create_empty_settings_file()
                return

            with open(SETTINGS_FILE, 'r') as f:
                try:
                    settings = json.load(f)
                    private_mode = settings.get('private_mode', False)
                    print(f"Loaded settings from {SETTINGS_FILE}")
                except json.JSONDecodeError as e:
                    print(f"JSON decode error in {SETTINGS_FILE}: {e}")
                    print("Settings file is corrupted, creating a new one with defaults")
                    create_empty_settings_file()
        except Exception as e:
            print(f"Error loading settings: {e}")
            create_empty_settings_file()
    else:
        print(f"Settings file not found at {SETTINGS_FILE}, creating with defaults")
        create_empty_settings_file()

def create_empty_settings_file():
    """Create a new settings file with default values"""
    global private_mode

    # Initialize with default settings
    private_mode = False

    # Create the settings file
    try:
        settings = {
            'private_mode': False
        }

        with open(SETTINGS_FILE, 'w') as f:
            json.dump(settings, f, indent=2)

        print(f"Created new settings file at {SETTINGS_FILE}")
    except Exception as e:
        print(f"Error creating settings file: {e}")
        import traceback
        traceback.print_exc()

def save_settings():
    """Save settings to file"""
    try:
        settings = {
            'private_mode': private_mode
        }

        with open(SETTINGS_FILE, 'w') as f:
            json.dump(settings, f, indent=2)

        print(f"Saved settings to {SETTINGS_FILE}")
    except Exception as e:
        print(f"Error saving settings: {e}")

class Todo:
    def __init__(self, title, description="", completed=False, id=None):
        global next_id
        if id is not None:
            # Use the provided ID (for loading from file)
            self.id = id
        else:
            # Auto-generate ID for new todos
            self.id = next_id
            next_id += 1

        self.title = title
        self.description = description
        self.completed = completed
        self.created_at = datetime.now()
        self.updated_at = self.created_at

        # No need to save here as this might be called during loading

    def update(self, title=None, description=None, completed=None):
        if title is not None:
            self.title = title
        if description is not None:
            self.description = description
        if completed is not None:
            self.completed = completed
        self.updated_at = datetime.now()

        # Save todos after update
        save_todos()

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'completed': self.completed,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# Load data from files after Todo class is defined
load_todos()
load_settings()
