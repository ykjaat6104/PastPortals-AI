"""
Museum API integration utilities
"""
import requests
from datetime import datetime

def search_smithsonian(query, api_key=None, limit=10):
    """
    Search Smithsonian Open Access API
    
    Args:
        query: Search query string
        api_key: Smithsonian API key (optional, but increases rate limits)
        limit: Number of results to return
        
    Returns:
        list: List of artifacts/artworks with metadata
    """
    try:
        base_url = "https://api.si.edu/openaccess/api/v1.0/search"
        
        params = {
            'q': query,
            'rows': limit,
            'start': 0
        }
        
        headers = {}
        if api_key:
            headers['X-Api-Key'] = api_key
        
        response = requests.get(base_url, params=params, headers=headers, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            
            artifacts = []
            for item in data.get('response', {}).get('rows', []):
                artifact = {
                    'id': item.get('id', ''),
                    'title': item.get('title', ''),
                    'type': item.get('type', ''),
                    'description': item.get('content', {}).get('descriptiveNonRepeating', {}).get('record_ID', ''),
                    'date': item.get('content', {}).get('indexedStructured', {}).get('date', ['']),
                    'culture': item.get('content', {}).get('freetext', {}).get('dataSource', []),
                    'images': [],
                    'url': f"https://www.si.edu/object/{item.get('id', '')}",
                    'source': 'Smithsonian'
                }
                
                # Extract images
                online_media = item.get('content', {}).get('descriptiveNonRepeating', {}).get('online_media', {}).get('media', [])
                for media in online_media[:3]:  # Limit to 3 images
                    if media.get('type') == 'Images':
                        artifact['images'].append({
                            'url': media.get('content', ''),
                            'thumbnail': media.get('thumbnail', '')
                        })
                
                artifacts.append(artifact)
            
            return artifacts
        
        return []
        
    except Exception as e:
        print(f"❌ Smithsonian API error: {str(e)}")
        return []

def get_smithsonian_object(object_id, api_key=None):
    """
    Get detailed information about a Smithsonian object
    
    Args:
        object_id: Smithsonian object ID
        api_key: Smithsonian API key (optional)
        
    Returns:
        dict: Object details or None if error
    """
    try:
        base_url = f"https://api.si.edu/openaccess/api/v1.0/content/{object_id}"
        
        headers = {}
        if api_key:
            headers['X-Api-Key'] = api_key
        
        response = requests.get(base_url, headers=headers, timeout=15)
        
        if response.status_code == 200:
            return response.json()
        
        return None
        
    except Exception as e:
        print(f"❌ Smithsonian object retrieval error: {str(e)}")
        return None

def search_europeana(query, limit=10):
    """
    Search Europeana API (requires API key - free registration)
    Note: This is a placeholder - requires API key registration at https://pro.europeana.eu/
    
    Args:
        query: Search query string
        limit: Number of results to return
        
    Returns:
        list: List of cultural heritage items
    """
    # Placeholder for Europeana integration
    # Users need to register for API key at: https://pro.europeana.eu/page/get-api
    print("⚠️  Europeana API requires registration. Visit: https://pro.europeana.eu/page/get-api")
    return []

def search_multiple_museums(query, api_key=None, limit_per_source=5):
    """
    Search across multiple museum APIs
    
    Args:
        query: Search query string
        api_key: Smithsonian API key (optional)
        limit_per_source: Results per museum source
        
    Returns:
        dict: Results grouped by source
    """
    results = {
        'smithsonian': [],
        'europeana': [],
        'total_count': 0
    }
    
    # Search Smithsonian
    smithsonian_results = search_smithsonian(query, api_key, limit_per_source)
    results['smithsonian'] = smithsonian_results
    results['total_count'] += len(smithsonian_results)
    
    # Add other museum APIs here as they become available
    
    return results

def format_museum_response(artifacts):
    """
    Format museum artifacts for display
    
    Args:
        artifacts: List of artifact dictionaries
        
    Returns:
        str: Markdown-formatted response
    """
    if not artifacts:
        return "No museum artifacts found for this query."
    
    response_parts = [f"## 🏛️ Museum Artifacts ({len(artifacts)} found)\n"]
    
    for i, artifact in enumerate(artifacts, 1):
        response_parts.append(f"\n### {i}. {artifact.get('title', 'Untitled')}")
        
        if artifact.get('description'):
            response_parts.append(f"\n**Description:** {artifact['description']}")
        
        if artifact.get('date'):
            date_str = artifact['date'][0] if isinstance(artifact['date'], list) else artifact['date']
            response_parts.append(f"**Date:** {date_str}")
        
        if artifact.get('culture'):
            culture_str = artifact['culture'][0] if isinstance(artifact['culture'], list) else artifact['culture']
            response_parts.append(f"**Culture:** {culture_str}")
        
        if artifact.get('type'):
            response_parts.append(f"**Type:** {artifact['type']}")
        
        if artifact.get('images'):
            response_parts.append(f"\n📷 **Images Available:** {len(artifact['images'])}")
        
        if artifact.get('url'):
            response_parts.append(f"\n🔗 [View at {artifact.get('source', 'Museum')}]({artifact['url']})")
        
        response_parts.append("\n---")
    
    return '\n'.join(response_parts)
