// DOM Elements
const todoList = document.getElementById('todo-list');
const statusMessage = document.getElementById('status-message');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load todos
    loadTodos();

    // Apply dark mode if enabled in localStorage
    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
});

// API Functions
async function loadTodos() {
    try {
        // Try to load todos without authentication first
        const response = await fetch('/api/todos');

        if (!response.ok) {
            if (response.status === 401) {
                // If unauthorized, show message that private mode is enabled
                showMessage('Private mode is enabled. Please use the admin panel to view todos.', 'error');
                todoList.innerHTML = '<p>Private mode is enabled. Please use the admin panel to view todos.</p>';
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
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
