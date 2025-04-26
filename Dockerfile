FROM ubuntu:22.04

# Set timezone and avoid interactive prompts
ENV TZ=UTC \
    DEBIAN_FRONTEND=noninteractive

# Set timezone
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

# Install dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        git \
        python3 \
        python3-pip \
        tzdata \
        curl \
        ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /todo_api

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
RUN pip3 install --no-cache-dir -r requirements.txt

# Create data directory for persistence and set permissions
RUN mkdir -p /todo_api/data && \
    chmod -R 777 /todo_api

# Expose port
EXPOSE 5000

# Command to run the application
CMD ["python3", "app.py"]
