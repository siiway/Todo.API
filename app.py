import os
from flask import Flask, render_template, send_from_directory
from flask_restful import Api
from routes import initialize_routes

# Get environment variables with default values
PAGE_TITLE = os.environ.get('PAGE_TITLE', 'ToDo App')
SHOW_ADMIN_PANEL_BUTTON = os.environ.get('SHOW_ADMIN_PANEL_BUTTON', 'true').lower() == 'true'
SERVER_HOST = os.environ.get('SERVER_HOST', '0.0.0.0')
SERVER_PORT = int(os.environ.get('SERVER_PORT', 5000))
DEBUG_MODE = os.environ.get('DEBUG_MODE', 'false').lower() in ['true', 'yes', '1', 'y']

app = Flask(__name__, static_url_path='/static')
api = Api(app)

# Initialize API routes
initialize_routes(api)


@app.route('/')
def index():
    return render_template(
        'index.html',
        page_title=PAGE_TITLE,
        show_admin_panel_button=SHOW_ADMIN_PANEL_BUTTON
    )


@app.route('/admin/')
def admin():
    return render_template(
        'admin.html',
        page_title=PAGE_TITLE
    )


@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)


if __name__ == '__main__':
    app.run(
        host=SERVER_HOST,
        port=SERVER_PORT,
        debug=DEBUG_MODE
    )
