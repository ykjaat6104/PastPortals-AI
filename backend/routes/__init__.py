"""
API route blueprints for AI Museum Guide
"""
from .qa_routes import qa_bp, set_vector_db as qa_set_vector_db, set_museum_api_key as qa_set_museum_key
from .translate_routes import translate_bp
from .summarize_routes import summarize_bp
from .museum_routes import museum_bp, set_api_key as museum_set_api_key
from .config_routes import config_bp, set_vector_db as config_set_vector_db

__all__ = [
    'qa_bp',
    'translate_bp',
    'summarize_bp',
    'museum_bp',
    'config_bp',
    'qa_set_vector_db',
    'qa_set_museum_key',
    'museum_set_api_key',
    'config_set_vector_db'
]
