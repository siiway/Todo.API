FROM python:3.11-slim

# Install git
RUN apt-get update && \
    apt-get install -y --no-install-recommends git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Clone the repository
RUN git clone --depth 1 https://github.com/siiway/Todo.API.git .

# Set environment variables for Python behavior
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Application environment variables will be set by the deployment platform
# Default values are only used if not provided by the platform:
# - TODO_TOKEN: Authentication token (required)
# - PAGE_TITLE: Custom title for the application (default: "ToDo App")
# - SHOW_ADMIN_PANEL_BUTTON: Whether to show admin panel button (default: true)
# - DEBUG_MODE: Enable Flask debug mode (default: false)

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create data directory for persistence
RUN mkdir -p /app/data && \
    chmod 777 /app/data

# Expose port
EXPOSE 5000

# Command to run the application
CMD ["python", "app.py"]
