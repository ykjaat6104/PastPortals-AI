from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import faiss
import json
import numpy as np
import asyncio
from functools import lru_cache
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
import google.generativeai as genai
import nest_asyncio
import re
import requests
from datetime import datetime

# Configure environment
os.environ['HF_HUB_DISABLE_SYMLINKS_WARNING'] = '1'
os.environ['HF_HUB_DOWNLOAD_TIMEOUT'] = '600'
nest_asyncio.apply()

app = Flask(__name__)
CORS(app)

# File Paths
FAISS_INDEX_PATH = "../data/faiss_index.bin"
TEXT_MAP_PATH = "../data/faiss_text_map.json"

# Global variables for AI model
gemini_model = None
api_key_configured = False

# Enhanced Historical Keywords - Worldwide Coverage
history_keywords = {
    # General historical terms
    "museum", "monument", "artifact", "historical", "history", "heritage", "exhibit",
    "dynasty", "emperor", "king", "queen", "ruler", "reign", "kingdom", "empire",
    "battle", "war", "treaty", "conquest", "rebellion", "revolution", "civilization",
    "ancient", "medieval", "renaissance", "colonial", "pre-modern", "modern",
    
    # World historical figures
    "alexander", "caesar", "napoleon", "churchill", "gandhi", "mandela", "lincoln",
    "cleopatra", "hannibal", "genghis khan", "charlemagne", "leonardo da vinci",
    "shakespeare", "galileo", "copernicus", "martin luther", "joan of arc",
    
    # Indian historical figures
    "shivaji", "akbar", "ashoka", "buddha", "chandragupta", "harsha", "prithviraj",
    "tipu sultan", "rani lakshmibai", "subhas chandra bose", "bhagat singh",
    
    # World civilizations and empires
    "roman empire", "byzantine", "ottoman", "persian", "chinese empire", "mayan",
    "aztec", "inca", "egyptian", "mesopotamian", "indus valley", "greek",
    "british empire", "french empire", "spanish empire", "portuguese empire",
    
    # Indian civilizations
    "maurya", "gupta", "chola", "mughal", "maratha", "vijayanagara", "delhi sultanate",
    
    # World historical events
    "world war", "french revolution", "american revolution", "industrial revolution",
    "crusades", "black death", "renaissance", "reformation", "cold war",
    "fall of rome", "fall of constantinople", "discovery of america",
    
    # Indian historical events
    "independence movement", "sepoy mutiny", "partition", "salt march", "quit india",
    "battle of panipat", "battle of plassey", "jallianwala bagh",
    
    # Historical places worldwide
    "colosseum", "great wall", "pyramids", "stonehenge", "machu picchu",
    "petra", "angkor wat", "acropolis", "versailles", "forbidden city",
    
    # Indian historical places
    "taj mahal", "red fort", "qutub minar", "hampi", "ajanta", "ellora", "khajuraho",
    "sanchi", "fatehpur sikri", "golden temple", "meenakshi temple"
}

@lru_cache(maxsize=1)
def get_embeddings_model():
    try:
        return HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-mpnet-base-v2",
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
    except Exception as e:
        print(f"Failed to load embeddings model: {str(e)}")
        return None

def setup_gemini(api_key):
    """Setup Gemini API with automatic model detection"""
    global gemini_model, api_key_configured
    
    try:
        genai.configure(api_key=api_key)
        
        # List of models to try in order of preference
        models_to_try = [
            'gemini-1.5-pro',
            'gemini-1.5-flash', 
            'gemini-pro',
            'gemini-1.0-pro',
            'models/gemini-pro',
            'models/gemini-1.5-flash',
            'models/gemini-1.5-pro'
        ]
        
        # Try to get available models
        try:
            available_models = [model.name for model in genai.list_models()]
            print(f"Found {len(available_models)} available models")
        except:
            available_models = []
        
        # Try each model until one works
        for model_name in models_to_try:
            try:
                model = genai.GenerativeModel(model_name)
                # Test the model with a simple query
                test_response = model.generate_content("Hello, respond with 'OK'")
                if test_response and test_response.text:
                    print(f"Successfully using model: {model_name}")
                    gemini_model = model
                    api_key_configured = True
                    return True
            except Exception as e:
                continue
        
        # If no model works
        print("No compatible models found")
        return False
        
    except Exception as e:
        print(f"API Configuration Error: {str(e)}")
        return False

def search_wikipedia(query):
    """Search Wikipedia for historical information"""
    try:
        # Clean query for Wikipedia
        clean_query = query.replace("tell me about", "").replace("what is", "").replace("who was", "").strip()
        
        # Wikipedia API search
        search_url = "https://en.wikipedia.org/w/api.php"
        search_params = {
            'action': 'query',
            'format': 'json',
            'list': 'search',
            'srsearch': clean_query,
            'srlimit': 3
        }
        
        search_response = requests.get(search_url, params=search_params, timeout=10)
        
        if search_response.status_code == 200:
            search_data = search_response.json()
            if search_data['query']['search']:
                # Get the first result
                page_title = search_data['query']['search'][0]['title']
                
                # Get page summary
                summary_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{page_title.replace(' ', '_')}"
                summary_response = requests.get(summary_url, timeout=10)
                
                if summary_response.status_code == 200:
                    summary_data = summary_response.json()
                    return {
                        'title': summary_data.get('title', ''),
                        'extract': summary_data.get('extract', ''),
                        'thumbnail': summary_data.get('thumbnail', {}).get('source', '') if summary_data.get('thumbnail') else '',
                        'url': f"https://en.wikipedia.org/wiki/{page_title.replace(' ', '_')}"
                    }
    except Exception as e:
        print(f"Wikipedia search error: {str(e)}")
    
    return None

def retrieve_relevant_text(query, k=3):
    try:
        if not os.path.exists(FAISS_INDEX_PATH) or not os.path.exists(TEXT_MAP_PATH):
            return None

        index = faiss.read_index(FAISS_INDEX_PATH)
        if index.ntotal == 0:
            return None

        with open(TEXT_MAP_PATH, "r", encoding="utf-8") as f:
            text_map = json.load(f)

        embeddings_model = get_embeddings_model()
        if not embeddings_model:
            return None

        query_embedding = embeddings_model.embed_query(query)
        query_embedding = np.array([query_embedding], dtype=np.float32)

        if query_embedding.shape[1] != index.d:
            return None

        distances, retrieved_indices = index.search(query_embedding, k=k)
        
        relevant_contexts = []
        for i in range(k):
            idx = retrieved_indices[0][i]
            if idx != -1 and str(idx) in text_map:
                relevant_contexts.append(text_map[str(idx)])
        
        return "\n\n".join(relevant_contexts) if relevant_contexts else None
    
    except Exception as e:
        print(f"Error retrieving text: {str(e)}")
        return None

def is_historical_question(question):
    """Enhanced check for historical questions"""
    question_lower = question.lower()
    
    # Check for history keywords
    if any(keyword.lower() in question_lower for keyword in history_keywords):
        return True
    
    # Check for time-related patterns
    time_patterns = [
        r'\b\d{1,4}\s*(BC|BCE|AD|CE)\b',
        r'\b\d{1,2}(st|nd|rd|th)\s+century\b',
        r'\b(ancient|medieval|renaissance|colonial|pre-modern|modern)\s+(era|period|times)\b'
    ]
    
    for pattern in time_patterns:
        if re.search(pattern, question_lower):
            return True
    
    # Historical query patterns
    historical_patterns = [
        r'\bwho\s+(was|were|ruled|conquered|founded|built|established)\b',
        r'\bwhen\s+(was|were|did)\b.+(built|founded|established|happen|occur)\b',
        r'\bwhat\s+happened\b.+(in|during|at)\b',
        r'\bwhy\s+did\b.+(war|battle|conflict|rebellion)\b',
        r'\bhow\s+did\b.+(empire|kingdom|civilization)\b'
    ]
    
    for pattern in historical_patterns:
        if re.search(pattern, question_lower):
            return True
    
    return False

def generate_history_prompt(question, relevant_context=None, wikipedia_info=None):
    """Generate comprehensive prompt for historical questions"""
    
    context_section = ""
    if relevant_context:
        context_section += f"\n**Knowledge Base Context:**\n{relevant_context}\n"
    
    if wikipedia_info:
        context_section += f"""
**Wikipedia Information:**
Title: {wikipedia_info.get('title', 'N/A')}
Summary: {wikipedia_info.get('extract', 'N/A')}
Source: {wikipedia_info.get('url', 'N/A')}
"""
    
    return f"""
You are a world-class historian and museum guide with expertise in global history, including ancient civilizations, empires, wars, cultural movements, and historical figures from all continents and time periods.

**Guidelines:**
- Provide accurate, detailed, and engaging responses for any historical topic worldwide
- Include specific dates, names, locations, and historical significance
- Structure your response with clear sections using markdown formatting
- Be educational yet conversational, suitable for museum visitors
- Include interesting facts, anecdotes, and lesser-known details
- If information is uncertain, acknowledge limitations
- For non-historical questions, politely redirect to historical topics

{context_section}

**User Question:**
{question}

**Response Structure:**
1. **Overview** - Brief introduction with key significance
2. **Historical Context** - Background, time period, and setting  
3. **Key Facts** - Important dates, events, figures, and developments
4. **Cultural Impact** - Significance and influence on society/world
5. **Interesting Details** - Fascinating stories, artifacts, or unique aspects
6. **Modern Legacy** - Current relevance, museums, or commemorations
7. **Related Topics** - Suggest other connected historical subjects

Please provide a comprehensive, well-structured, and engaging response suitable for learners of all ages visiting a world history museum.
"""

async def get_ai_response(question):
    """Get AI response with fallback to Wikipedia"""
    global gemini_model, api_key_configured
    
    # Check if question is historical
    if not is_historical_question(question):
        return {
            'response': "🏛️ I specialize in world history and historical topics. Please ask about historical events, figures, civilizations, wars, cultural movements, or historical places from any time period and region.",
            'source': 'filter',
            'wikipedia_info': None
        }
    
    # Get context and Wikipedia info
    relevant_context = retrieve_relevant_text(question)
    wikipedia_info = search_wikipedia(question)
    
    # Try AI response first if configured
    if api_key_configured and gemini_model:
        try:
            prompt = generate_history_prompt(question, relevant_context, wikipedia_info)
            response = gemini_model.generate_content(prompt)
            
            if response and response.text:
                return {
                    'response': response.text,
                    'source': 'ai',
                    'wikipedia_info': wikipedia_info
                }
        except Exception as e:
            print(f"AI response error: {str(e)}")
    
    # Fallback to Wikipedia-based response
    return generate_fallback_response(question, relevant_context, wikipedia_info)

def generate_fallback_response(question, relevant_context=None, wikipedia_info=None):
    """Generate response when AI is unavailable"""
    
    response_parts = []
    
    if wikipedia_info:
        response_parts.append(f"## 📚 {wikipedia_info.get('title', 'Historical Information')}")
        response_parts.append(f"\n{wikipedia_info.get('extract', '')}")
        
        if wikipedia_info.get('url'):
            response_parts.append(f"\n**Source:** [Wikipedia]({wikipedia_info['url']})")
    
    if relevant_context:
        response_parts.append(f"\n## 📖 Additional Context\n{relevant_context}")
    
    if not response_parts:
        response_parts.append(f"""
## 🔍 Historical Query: {question}

I found limited information for this specific query. This could be because:
- The topic requires more specific search terms
- It's a very specialized historical topic
- The information might be in a different language or source

**Suggestions:**
- Try rephrasing with more specific terms
- Include time periods, locations, or key figures
- Configure AI functionality for comprehensive responses

For detailed AI-powered analysis, please ensure your Gemini API is properly configured.
        """)
    
    return {
        'response': '\n'.join(response_parts),
        'source': 'fallback',
        'wikipedia_info': wikipedia_info
    }

# API Routes
@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'online',
        'timestamp': datetime.now().isoformat(),
        'ai_configured': api_key_configured,
        'services': {
            'wikipedia': True,
            'embeddings': get_embeddings_model() is not None,
            'vector_db': os.path.exists(FAISS_INDEX_PATH)
        }
    })

@app.route('/configure', methods=['POST'])
def configure_api():
    """Configure AI API key"""
    try:
        data = request.get_json()
        api_key = data.get('api_key', '').strip()
        
        if not api_key:
            return jsonify({'error': 'API key is required'}), 400
        
        success = setup_gemini(api_key)
        
        if success:
            return jsonify({
                'message': 'API configured successfully',
                'ai_enabled': True
            })
        else:
            return jsonify({
                'error': 'Failed to configure API. Please check your API key.',
                'ai_enabled': False
            }), 400
            
    except Exception as e:
        return jsonify({'error': f'Configuration error: {str(e)}'}), 500

@app.route('/ask', methods=['POST'])
def ask_question():
    """Main question answering endpoint"""
    try:
        data = request.get_json()
        question = data.get('question', '').strip()
        
        if not question:
            return jsonify({'error': 'Question is required'}), 400
        
        # Get AI response
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(get_ai_response(question))
        finally:
            loop.close()
        
        return jsonify({
            'question': question,
            'answer': result['response'],
            'source': result['source'],
            'wikipedia_info': result['wikipedia_info'],
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to process question: {str(e)}'}), 500

@app.route('/translate', methods=['POST'])
def translate_text():
    """Translate text to different languages"""
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        target_language = data.get('language', '').strip()
        
        if not text or not target_language:
            return jsonify({'error': 'Text and target language are required'}), 400
        
        if not api_key_configured or not gemini_model:
            return jsonify({'error': 'AI translation requires API configuration'}), 400
        
        if target_language.lower() == 'english':
            return jsonify({
                'original_text': text,
                'translated_text': text,
                'target_language': target_language
            })
        
        prompt = f"""
        Translate the following historical text to {target_language} while preserving:
        1. All proper names, places, and historical terms
        2. Dates and numbers exactly as they appear
        3. The formal, educational tone
        4. Cultural context and meaning
        
        Text to translate:
        {text}
        
        Provide only the translation without any additional commentary or explanations.
        """
        
        response = gemini_model.generate_content(prompt)
        
        if response and response.text:
            return jsonify({
                'original_text': text,
                'translated_text': response.text,
                'target_language': target_language,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({'error': 'Translation failed - empty response'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Translation error: {str(e)}'}), 500

@app.route('/summarize', methods=['POST'])
def summarize_text():
    """Summarize historical content"""
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': 'Text to summarize is required'}), 400
        
        if not api_key_configured or not gemini_model:
            return jsonify({'error': 'AI summarization requires API configuration'}), 400
        
        prompt = f"""
        Create a concise summary of this historical content:
        
        Guidelines:
        - Keep all essential facts, dates, and names
        - Maintain historical accuracy
        - Maximum 4-5 sentences
        - Preserve the most important information
        - Use clear, educational language
        
        Content to summarize:
        {text}
        
        Provide only the summary without additional commentary.
        """
        
        response = gemini_model.generate_content(prompt)
        
        if response and response.text:
            return jsonify({
                'original_length': len(text.split()),
                'summary': response.text,
                'summary_length': len(response.text.split()),
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({'error': 'Summarization failed - empty response'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Summarization error: {str(e)}'}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Create data directory if it doesn't exist
    os.makedirs('../data', exist_ok=True)
    
    print("🏛️ AI Museum Guide Backend Starting...")
    print("📊 Checking system status...")
    
    # Check embeddings model
    embeddings_status = "✅" if get_embeddings_model() else "❌"
    print(f"   Embeddings Model: {embeddings_status}")
    
    # Check vector database
    vector_db_status = "✅" if os.path.exists(FAISS_INDEX_PATH) else "⚠️"
    print(f"   Vector Database: {vector_db_status}")
    
    print(f"   Wikipedia Search: ✅")
    print(f"   AI Configuration: {'✅' if api_key_configured else '⚠️  Requires setup'}")
    
    print("\n🚀 Server starting on http://localhost:5000")
    print("📖 Configure your AI API key through the frontend or POST /configure")
    
    app.run(host='0.0.0.0', port=5000, debug=False)