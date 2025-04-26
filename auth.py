import os
from functools import wraps
from flask import request
import models  # Import the module, not the variable

def check_token():
    """Helper function to check if the token is valid"""
    # Get the token from environment variable
    expected_token = os.environ.get('TODO_TOKEN')

    if not expected_token:
        return False, {'message': 'Server configuration error: TOKEN not set'}, 500

    # Get the token from the Authorization header
    auth_header = request.headers.get('Authorization')

    if not auth_header:
        return False, {'message': 'Authorization header is missing'}, 401

    # Check if the header format is correct (Bearer token)
    parts = auth_header.split()

    if len(parts) != 2 or parts[0].lower() != 'bearer':
        return False, {'message': 'Authorization header must be in format: Bearer TOKEN'}, 401

    token = parts[1]

    # Verify the token
    if token != expected_token:
        return False, {'message': 'Invalid token'}, 401

    return True, None, None

def token_required(f):
    """Decorator for endpoints that require authentication only in private mode"""
    @wraps(f)
    def decorated(*args, **kwargs):
        # If private mode is enabled, check authentication
        if models.private_mode:  # Access the variable through the module
            is_valid, error_message, error_code = check_token()
            if not is_valid:
                return error_message, error_code

        return f(*args, **kwargs)

    return decorated

def auth_required(f):
    """Decorator for endpoints that always require authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        is_valid, error_message, error_code = check_token()
        if not is_valid:
            return error_message, error_code

        return f(*args, **kwargs)

    return decorated
