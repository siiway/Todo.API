from flask import request, send_file, make_response, jsonify
from flask_restful import Resource
from models import Todo, todos, save_todos, save_settings, TODOS_FILE
import models  # Import the module for accessing private_mode
from auth import token_required, auth_required
import os
import json
from datetime import datetime

class TodoListResource(Resource):
    @token_required
    def get(self):
        return {'todos': [todo.to_dict() for todo in todos.values()]}

    @auth_required
    def post(self):
        data = request.get_json()
        if not data or 'title' not in data:
            return {'message': 'Title is required'}, 400

        todo = Todo(
            title=data['title'],
            description=data.get('description', ''),
            completed=data.get('completed', False)
        )
        todos[todo.id] = todo
        # Save todos to file
        save_todos()
        return todo.to_dict(), 201

class TodoResource(Resource):
    @token_required
    def get(self, todo_id):
        todo_id = int(todo_id)
        if todo_id not in todos:
            return {'message': 'Todo not found'}, 404
        return todos[todo_id].to_dict()

    @auth_required
    def put(self, todo_id):
        todo_id = int(todo_id)
        if todo_id not in todos:
            return {'message': 'Todo not found'}, 404

        data = request.get_json()
        todos[todo_id].update(
            title=data.get('title'),
            description=data.get('description'),
            completed=data.get('completed')
        )
        return todos[todo_id].to_dict()

    @auth_required
    def delete(self, todo_id):
        todo_id = int(todo_id)
        if todo_id not in todos:
            return {'message': 'Todo not found'}, 404

        del todos[todo_id]
        # Save todos to file
        save_todos()
        return {'message': 'Todo deleted successfully'}

class PrivateModeResource(Resource):
    def get(self):
        return {'private_mode': models.private_mode}

    @auth_required
    def post(self):
        data = request.get_json()
        if data and 'enabled' in data:
            models.private_mode = bool(data['enabled'])
            # Save settings to file
            save_settings()
            return {'message': f'Private mode {"enabled" if models.private_mode else "disabled"}', 'private_mode': models.private_mode}
        return {'message': 'Missing "enabled" field in request body'}, 400

class TodoExportResource(Resource):
    @auth_required
    def get(self):
        """Export todos as a downloadable JSON file"""
        try:
            # Create a formatted JSON with todos data
            todos_data = {}
            for todo_id, todo in todos.items():
                todos_data[str(todo_id)] = todo.to_dict()

            export_data = {
                'todos': todos_data,
                'next_id': models.next_id,
                'exported_at': datetime.now().isoformat(),
                'count': len(todos)
            }

            # Create a response with the JSON data
            response = make_response(jsonify(export_data))
            response.headers['Content-Disposition'] = f'attachment; filename=todos_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
            response.headers['Content-Type'] = 'application/json'

            return response
        except Exception as e:
            return {'message': f'Error exporting todos: {str(e)}'}, 500

class TodoImportResource(Resource):
    @auth_required
    def post(self):
        """Import todos from a JSON file"""
        try:
            # Check if the request contains JSON data
            if not request.is_json:
                return {'message': 'Request must contain JSON data'}, 400

            data = request.get_json()

            # Validate the JSON structure
            if 'todos' not in data:
                return {'message': 'Invalid JSON format: missing "todos" field'}, 400

            if 'next_id' not in data:
                return {'message': 'Invalid JSON format: missing "next_id" field'}, 400

            # Get the current todos count for reporting
            old_count = len(todos)

            # Clear existing todos
            todos.clear()

            # Import todos from the JSON data
            for id_str, todo_data in data['todos'].items():
                todo_id = int(id_str)

                # Create a new Todo object
                todo = models.Todo(
                    title=todo_data['title'],
                    description=todo_data.get('description', ''),
                    completed=todo_data.get('completed', False),
                    id=todo_id
                )

                # Set timestamps if available
                if 'created_at' in todo_data:
                    todo.created_at = datetime.fromisoformat(todo_data['created_at'])
                if 'updated_at' in todo_data:
                    todo.updated_at = datetime.fromisoformat(todo_data['updated_at'])

                # Add the todo to the collection
                todos[todo_id] = todo

            # Update the next_id counter
            models.next_id = data['next_id']

            # Save the imported todos to file
            models.save_todos()

            # Return success message
            return {
                'message': 'Todos imported successfully',
                'imported_count': len(todos),
                'previous_count': old_count
            }
        except Exception as e:
            return {'message': f'Error importing todos: {str(e)}'}, 500

def initialize_routes(api):
    api.add_resource(TodoListResource, '/api/todos')
    api.add_resource(TodoResource, '/api/todos/<todo_id>')
    api.add_resource(PrivateModeResource, '/api/private-mode')
    api.add_resource(TodoExportResource, '/api/todos/export')
    api.add_resource(TodoImportResource, '/api/todos/import')
