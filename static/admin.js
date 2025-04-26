// Global variables
let token = localStorage.getItem('todoToken') || '';
let isPrivateMode = false;
let isAuthenticated = false;
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// DOM Elements
const authSection = document.getElementById('auth-section');
const adminContent = document.getElementById('admin-content');
const todoForm = document.getElementById('todo-form');
const todoList = document.getElementById('todo-list');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const tokenInput = document.getElementById('token');
const saveTokenBtn = document.getElementById('save-token');
const logoutBtn = document.getElementById('logout-btn');
const privateModeToggle = document.getElementById('private-mode');
const darkModeToggle = document.getElementById('dark-mode');
const statusMessage = document.getElementById('status-message');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Set token from localStorage if available
    if (token) {
        tokenInput.value = token;
        // Try to authenticate with saved token
        authenticate();
    }

    // Apply dark mode if enabled
    if (isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        darkModeToggle.checked = true;
    }
});

todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTodo();
});

saveTokenBtn.addEventListener('click', () => {
    authenticate();
});

logoutBtn.addEventListener('click', () => {
    logout();
});

privateModeToggle.addEventListener('change', () => {
    togglePrivateMode();
});

darkModeToggle.addEventListener('change', () => {
    toggleDarkMode();
});

// Authentication Functions
async function authenticate() {
    token = tokenInput.value.trim();
    if (!token) {
        showMessage('Please enter a token', 'error');
        return;
    }

    try {
        // Try to access private-mode endpoint to check if token is valid
        const response = await fetch('/api/private-mode', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Authentication failed: ${response.status}`);
        }

        // If we get here, authentication was successful
        localStorage.setItem('todoToken', token);
        isAuthenticated = true;

        // Get private mode status
        const data = await response.json();
        isPrivateMode = data.private_mode;
        privateModeToggle.checked = isPrivateMode;

        // Show admin content
        authSection.style.display = 'none';
        adminContent.classList.remove('hidden');

        // Load todos
        loadTodos();

        showMessage('Authentication successful', 'success');
    } catch (error) {
        console.error('Authentication error:', error);
        showMessage('Authentication failed. Please check your token.', 'error');
        isAuthenticated = false;
    }
}

function logout() {
    // Clear token from localStorage
    localStorage.removeItem('todoToken');
    token = '';
    isAuthenticated = false;

    // Hide admin content and show auth section
    adminContent.classList.add('hidden');
    authSection.style.display = 'block';

    // Clear token input
    tokenInput.value = '';

    showMessage('Logged out successfully', 'success');
}

// API Functions
async function loadTodos() {
    if (!isAuthenticated) return;

    try {
        const response = await fetch('/api/todos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        renderTodos(data.todos);
    } catch (error) {
        console.error('Error loading todos:', error);
        showMessage('Failed to load todos', 'error');
    }
}

async function addTodo() {
    if (!isAuthenticated) {
        showMessage('You must be authenticated to add todos', 'error');
        return;
    }

    if (!titleInput.value.trim()) {
        showMessage('Title is required', 'error');
        return;
    }

    try {
        const response = await fetch('/api/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: titleInput.value,
                description: descriptionInput.value
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        await response.json(); // We don't need to use the returned todo
        showMessage('Todo added successfully', 'success');

        // Clear form
        titleInput.value = '';
        descriptionInput.value = '';

        // Reload todos
        loadTodos();
    } catch (error) {
        console.error('Error adding todo:', error);
        showMessage('Failed to add todo', 'error');
    }
}

async function updateTodo(id, data) {
    if (!isAuthenticated) {
        showMessage('You must be authenticated to update todos', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        showMessage('Todo updated successfully', 'success');
        loadTodos();
    } catch (error) {
        console.error('Error updating todo:', error);
        showMessage('Failed to update todo', 'error');
    }
}

async function deleteTodo(id) {
    if (!isAuthenticated) {
        showMessage('You must be authenticated to delete todos', 'error');
        return;
    }

    if (!confirm('Are you sure you want to delete this todo?')) {
        return;
    }

    try {
        const response = await fetch(`/api/todos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        showMessage('Todo deleted successfully', 'success');
        loadTodos();
    } catch (error) {
        console.error('Error deleting todo:', error);
        showMessage('Failed to delete todo', 'error');
    }
}

async function togglePrivateMode() {
    if (!isAuthenticated) {
        showMessage('You must be authenticated to toggle private mode', 'error');
        privateModeToggle.checked = isPrivateMode; // Reset to previous state
        return;
    }

    try {
        const response = await fetch('/api/private-mode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                enabled: privateModeToggle.checked
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        isPrivateMode = data.private_mode;
        showMessage(`Private mode ${isPrivateMode ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
        console.error('Error toggling private mode:', error);
        showMessage('Failed to toggle private mode', 'error');
        privateModeToggle.checked = isPrivateMode; // Reset to previous state
    }
}

// Helper Functions
function renderTodos(todos) {
    todoList.innerHTML = '';

    if (!todos || todos.length === 0) {
        todoList.innerHTML = '<p>No todos found</p>';
        return;
    }

    todos.forEach(todo => {
        const todoItem = document.createElement('div');
        todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;

        todoItem.innerHTML = `
            <div class="todo-content">
                <div class="todo-title">${escapeHtml(todo.title)}</div>
                <div class="todo-description">${escapeHtml(todo.description)}</div>
            </div>
            <div class="todo-actions">
                <button class="complete-btn" onclick="updateTodo(${todo.id}, {completed: ${!todo.completed}})">${todo.completed ? 'Undo' : 'Complete'}</button>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
            </div>
        `;

        todoList.appendChild(todoItem);
    });
}

function toggleDarkMode() {
    isDarkMode = darkModeToggle.checked;

    if (isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('darkMode', 'true');
        showMessage('Dark mode enabled', 'success');
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('darkMode', 'false');
        showMessage('Light mode enabled', 'success');
    }
}

function showMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.classList.remove('hidden');

    // Hide message after 3 seconds
    setTimeout(() => {
        statusMessage.classList.add('hidden');
    }, 3000);
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
