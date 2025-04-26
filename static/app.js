// Global variables
let token = localStorage.getItem('todoToken') || '';
let isPrivateMode = false;

// DOM Elements
const todoForm = document.getElementById('todo-form');
const todoList = document.getElementById('todo-list');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const tokenInput = document.getElementById('token');
const saveTokenBtn = document.getElementById('save-token');
const privateModeToggle = document.getElementById('private-mode');
const statusMessage = document.getElementById('status-message');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Set token from localStorage if available
    if (token) {
        tokenInput.value = token;
        checkPrivateMode();
    }
    
    // Load todos
    loadTodos();
});

todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTodo();
});

saveTokenBtn.addEventListener('click', () => {
    saveToken();
});

privateModeToggle.addEventListener('change', () => {
    togglePrivateMode();
});

// API Functions
async function loadTodos() {
    try {
        let headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        
        const response = await fetch('/api/todos', { headers });
        
        if (!response.ok) {
            if (response.status === 401) {
                showMessage('Authentication required to view todos', 'error');
                todoList.innerHTML = '<p>Please provide a valid token to view todos</p>';
                return;
            }
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
    if (!titleInput.value.trim()) {
        showMessage('Title is required', 'error');
        return;
    }
    
    if (!token) {
        showMessage('Authentication token is required to add todos', 'error');
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
        
        const newTodo = await response.json();
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
    if (!token) {
        showMessage('Authentication token is required to update todos', 'error');
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
    if (!token) {
        showMessage('Authentication token is required to delete todos', 'error');
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

async function checkPrivateMode() {
    if (!token) return;
    
    try {
        const response = await fetch('/api/private-mode', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        isPrivateMode = data.private_mode;
        privateModeToggle.checked = isPrivateMode;
    } catch (error) {
        console.error('Error checking private mode:', error);
    }
}

async function togglePrivateMode() {
    if (!token) {
        showMessage('Authentication token is required to toggle private mode', 'error');
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
        
        // Reload todos as permissions may have changed
        loadTodos();
    } catch (error) {
        console.error('Error toggling private mode:', error);
        showMessage('Failed to toggle private mode', 'error');
        privateModeToggle.checked = isPrivateMode; // Reset to previous state
    }
}

// Helper Functions
function saveToken() {
    token = tokenInput.value.trim();
    localStorage.setItem('todoToken', token);
    showMessage('Token saved', 'success');
    
    // Check private mode with new token
    checkPrivateMode();
    
    // Reload todos with new token
    loadTodos();
}

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
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
