"""
Vector database utilities for FAISS operations
"""
import faiss
import json
import numpy as np
import os
from .ai_utils import get_embeddings_model

def load_vector_db(index_path, text_map_path):
    """
    Load FAISS index and text mapping
    
    Args:
        index_path: Path to FAISS index file
        text_map_path: Path to text mapping JSON
        
    Returns:
        tuple: (faiss_index, text_map) or (None, None) if error
    """
    try:
        if not os.path.exists(index_path) or not os.path.exists(text_map_path):
            print(f"Vector database files not found")
            return None, None
        
        index = faiss.read_index(index_path)
        
        with open(text_map_path, 'r', encoding='utf-8') as f:
            text_map = json.load(f)
        
        print(f"Loaded vector database: {index.ntotal} vectors")
        return index, text_map
        
    except Exception as e:
        print(f"Error loading vector database: {str(e)}")
        return None, None

def save_vector_db(index, text_map, index_path, text_map_path):
    """
    Save FAISS index and text mapping
    
    Args:
        index: FAISS index object
        text_map: Dictionary mapping indices to text
        index_path: Path to save FAISS index
        text_map_path: Path to save text mapping
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(index_path), exist_ok=True)
        
        faiss.write_index(index, index_path)
        
        with open(text_map_path, 'w', encoding='utf-8') as f:
            json.dump(text_map, f, ensure_ascii=False, indent=2)
        
        print(f"Saved vector database: {index.ntotal} vectors")
        return True
        
    except Exception as e:
        print(f"Error saving vector database: {str(e)}")
        return False

def create_vector_db(texts, dimension=768):
    """
    Create new FAISS index from texts
    
    Args:
        texts: List of text strings
        dimension: Embedding dimension (default 768 for MPNet)
        
    Returns:
        tuple: (faiss_index, text_map) or (None, None) if error
    """
    try:
        embeddings_model = get_embeddings_model()
        if not embeddings_model:
            return None, None
        
        # Create embeddings
        print(f"Creating embeddings for {len(texts)} texts...")
        embeddings = embeddings_model.embed_documents(texts)
        embeddings_array = np.array(embeddings, dtype=np.float32)
        
        # Create FAISS index
        index = faiss.IndexFlatL2(dimension)
        index.add(embeddings_array)
        
        # Create text mapping
        text_map = {str(i): text for i, text in enumerate(texts)}
        
        print(f"Created vector database with {index.ntotal} vectors")
        return index, text_map
        
    except Exception as e:
        print(f"Error creating vector database: {str(e)}")
        return None, None

def add_to_vector_db(index, text_map, new_texts):
    """
    Add new texts to existing FAISS index
    
    Args:
        index: Existing FAISS index
        text_map: Existing text mapping
        new_texts: List of new text strings
        
    Returns:
        tuple: (updated_index, updated_text_map)
    """
    try:
        embeddings_model = get_embeddings_model()
        if not embeddings_model:
            return index, text_map
        
        # Get starting index
        start_idx = index.ntotal
        
        # Create embeddings for new texts
        print(f"Adding {len(new_texts)} new texts to vector database...")
        new_embeddings = embeddings_model.embed_documents(new_texts)
        new_embeddings_array = np.array(new_embeddings, dtype=np.float32)
        
        # Add to index
        index.add(new_embeddings_array)
        
        # Update text mapping
        for i, text in enumerate(new_texts):
            text_map[str(start_idx + i)] = text
        
        print(f"Vector database now has {index.ntotal} vectors")
        return index, text_map
        
    except Exception as e:
        print(f"Error adding to vector database: {str(e)}")
        return index, text_map

def search_vector_db(query, index, text_map, k=3):
    """
    Search FAISS index for relevant contexts
    
    Args:
        query: Search query string
        index: FAISS index object
        text_map: Text mapping dictionary
        k: Number of results to return
        
    Returns:
        list: List of relevant text contexts
    """
    try:
        if not index or not text_map or index.ntotal == 0:
            return []
        
        embeddings_model = get_embeddings_model()
        if not embeddings_model:
            return []
        
        # Create query embedding
        query_embedding = embeddings_model.embed_query(query)
        query_embedding = np.array([query_embedding], dtype=np.float32)
        
        # Validate dimensions
        if query_embedding.shape[1] != index.d:
            print(f"Dimension mismatch: query={query_embedding.shape[1]}, index={index.d}")
            return []
        
        # Search
        distances, retrieved_indices = index.search(query_embedding, min(k, index.ntotal))
        
        # Extract relevant contexts
        relevant_contexts = []
        for i in range(min(k, len(retrieved_indices[0]))):
            idx = retrieved_indices[0][i]
            if idx != -1 and str(idx) in text_map:
                relevant_contexts.append(text_map[str(idx)])
        
        return relevant_contexts
        
    except Exception as e:
        print(f"Error searching vector database: {str(e)}")
        return []

def get_vector_db_stats(index, text_map):
    """
    Get statistics about the vector database
    
    Args:
        index: FAISS index object
        text_map: Text mapping dictionary
        
    Returns:
        dict: Statistics dictionary
    """
    if not index or not text_map:
        return {
            'total_vectors': 0,
            'dimension': 0,
            'text_entries': 0,
            'status': 'empty'
        }
    
    return {
        'total_vectors': index.ntotal,
        'dimension': index.d,
        'text_entries': len(text_map),
        'status': 'active' if index.ntotal > 0 else 'empty'
    }
