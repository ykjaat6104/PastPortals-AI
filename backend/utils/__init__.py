"""
Utility modules for AI Museum Guide backend
"""
from .ai_utils import (
    setup_gemini,
    get_gemini_model,
    is_gemini_configured,
    generate_content,
    generate_with_vision,
    get_embeddings_model
)

from .vector_utils import (
    load_vector_db,
    save_vector_db,
    create_vector_db,
    add_to_vector_db,
    search_vector_db,
    get_vector_db_stats
)

from .wikipedia_utils import (
    search_wikipedia,
    get_wikipedia_summary,
    search_and_summarize,
    get_related_articles
)

from .museum_utils import (
    search_smithsonian,
    search_multiple_museums,
    format_museum_response
)

from .history_utils import (
    is_historical_question,
    extract_historical_entities,
    generate_history_prompt,
    generate_fallback_response,
    get_historical_categories,
    HISTORY_KEYWORDS
)

__all__ = [
    # AI utilities
    'setup_gemini',
    'get_gemini_model',
    'is_gemini_configured',
    'generate_content',
    'generate_with_vision',
    'get_embeddings_model',
    
    # Vector database
    'load_vector_db',
    'save_vector_db',
    'create_vector_db',
    'add_to_vector_db',
    'search_vector_db',
    'get_vector_db_stats',
    
    # Wikipedia
    'search_wikipedia',
    'get_wikipedia_summary',
    'search_and_summarize',
    'get_related_articles',
    
    # Museums
    'search_smithsonian',
    'search_multiple_museums',
    'format_museum_response',
    
    # Historical content
    'is_historical_question',
    'extract_historical_entities',
    'generate_history_prompt',
    'generate_fallback_response',
    'get_historical_categories',
    'HISTORY_KEYWORDS'
]
