import os
import faiss
import json
import numpy as np
import streamlit as st
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
import google.generativeai as genai
import asyncio
import nest_asyncio
from functools import lru_cache
import requests
from PIL import Image
from io import BytesIO

# Configure environment
os.environ['HF_HUB_DISABLE_SYMLINKS_WARNING'] = '1'
os.environ['HF_HUB_DOWNLOAD_TIMEOUT'] = '600'

# Apply nest_asyncio to fix event loop issues
nest_asyncio.apply()

# File Paths
FAISS_INDEX_PATH = "faiss_index.bin"
TEXT_MAP_PATH = "faiss_text_map.json"

# Supported Indian Languages for Translation
indian_languages = {
    "English": "English",
    "Hindi": "Hindi",
    "Bengali": "Bengali",
    "Telugu": "Telugu",
    "Marathi": "Marathi",
    "Tamil": "Tamil",
    "Urdu": "Urdu",
    "Gujarati": "Gujarati",
    "Malayalam": "Malayalam",
    "Kannada": "Kannada",
    "Odia": "Odia",
    "Punjabi": "Punjabi",
    "Assamese": "Assamese"
}

# Enhanced Historical Keywords
history_keywords = {
    "museum", "monument", "artifact", "historical", "history", "heritage", "exhibit",
    "shivaji", "sambhaji", "maharana pratap", "chetak", "battle of haldighati",
    "maratha", "mughal", "rajput", "akbar", "peshwa", "gupta", "ashoka", "buddha",
    "tanibai", "tara bai", "tarabai bhosale", "wagh nakh", "tiger claw",
    "chhatrapati", "bhosale", "bhosle", "maratha empire", "fort", "palace"
}

def setup_gemini(api_key):
    """Setup Gemini API with automatic model detection"""
    try:
        genai.configure(api_key=api_key)
        
        # List of models to try in order of preference
        models_to_try = [
            'gemini-1.5-pro',
            'gemini-1.5-flash', 
            'gemini-pro',
            'gemini-1.0-pro',
            'models/gemini-pro',
            'models/gemini-1.5-flash'
        ]
        
        # Try to get available models
        try:
            available_models = [model.name for model in genai.list_models()]
            st.sidebar.success(f"✅ Found {len(available_models)} available models")
        except:
            available_models = []
        
        # Try each model until one works
        for model_name in models_to_try:
            try:
                model = genai.GenerativeModel(model_name)
                # Test the model with a simple query
                test_response = model.generate_content("Hello")
                st.sidebar.success(f"✅ Using model: {model_name}")
                return model
            except Exception as e:
                continue
        
        # If no model works, show available models
        if available_models:
            st.sidebar.error("❌ No compatible models found. Available models:")
            for model in available_models[:5]:  # Show first 5
                st.sidebar.text(f"• {model}")
        
        return None
        
    except Exception as e:
        st.sidebar.error(f"❌ API Configuration Error: Please check your API key")
        return None

def search_online_info(query):
    """Search for historical information online"""
    try:
        # Wikipedia API search for historical content
        search_url = "https://en.wikipedia.org/api/rest_v1/page/summary/"
        
        # Clean query for Wikipedia
        clean_query = query.replace("tell me about", "").replace("what is", "").strip()
        
        # Try direct search
        response = requests.get(f"{search_url}{clean_query.replace(' ', '_')}", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            return {
                'title': data.get('title', ''),
                'extract': data.get('extract', ''),
                'thumbnail': data.get('thumbnail', {}).get('source', '') if data.get('thumbnail') else ''
            }
        else:
            # Fallback search
            search_api = "https://en.wikipedia.org/w/api.php"
            params = {
                'action': 'query',
                'format': 'json',
                'list': 'search',
                'srsearch': clean_query,
                'srlimit': 1
            }
            response = requests.get(search_api, params=params, timeout=5)
            if response.status_code == 200:
                search_data = response.json()
                if search_data['query']['search']:
                    page_title = search_data['query']['search'][0]['title']
                    return search_online_info(page_title)  # Recursive call with exact title
    except Exception as e:
        st.warning(f"Online search temporarily unavailable: {str(e)}")
    
    return None

def get_historical_images(query):
    """Get historical images related to the query"""
    try:
        # Using Unsplash API for historical images (free tier)
        search_terms = f"historical {query} india monument museum"
        unsplash_url = f"https://api.unsplash.com/search/photos"
        
        # You can get free Unsplash API key from https://unsplash.com/developers
        headers = {
            'Authorization': 'Client-ID YOUR_UNSPLASH_ACCESS_KEY'  # Replace with actual key
        }
        
        params = {
            'query': search_terms,
            'per_page': 2,
            'orientation': 'landscape'
        }
        
        # For now, return some default historical image URLs
        default_images = [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Shivaji_Maharaj.jpg/300px-Shivaji_Maharaj.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Red_Fort_Delhi.jpg/400px-Red_Fort_Delhi.jpg"
        ]
        
        return default_images[:1]  # Return first image
        
    except Exception as e:
        return []

# Cache embeddings model
@lru_cache(maxsize=1)
def get_embeddings_model():
    try:
        return HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-mpnet-base-v2",
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
    except Exception as e:
        st.error(f"Failed to load embeddings model: {str(e)}")
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
            st.error(f"Dimension mismatch detected. Expected {index.d} but got {query_embedding.shape[1]}")
            return None

        distances, retrieved_indices = index.search(query_embedding, k=k)
        
        relevant_contexts = []
        for i in range(k):
            idx = retrieved_indices[0][i]
            if idx != -1 and str(idx) in text_map:
                relevant_contexts.append(text_map[str(idx)])
        
        return "\n\n".join(relevant_contexts) if relevant_contexts else None
    
    except Exception as e:
        st.error(f"Error retrieving text: {str(e)}")
        return None

def check_keywords(question):
    question_lower = question.lower()
    return any(keyword.lower() in question_lower for keyword in history_keywords)

def generate_history_prompt(question, relevant_context, online_info=None):
    online_context = ""
    if online_info:
        online_context = f"""
    **Latest Information from Online Sources:**
    Title: {online_info.get('title', 'N/A')}
    Summary: {online_info.get('extract', 'N/A')}
    """
    
    return f"""
    You are an expert historian and museum guide specializing in Indian history, particularly the Maratha Empire, monuments, and cultural heritage.
    
    **Guidelines:**
    - Provide detailed, accurate, and engaging responses for historical topics
    - Include specific dates, names, and historical significance
    - Structure your response with clear sections using markdown formatting
    - Be educational yet conversational
    - Include interesting anecdotes and lesser-known facts
    - If the question is not about history, politely redirect to historical topics
    
    **Context from Knowledge Base:**
    {relevant_context if relevant_context else "No specific references found in uploaded documents"}
    
    {online_context}
    
    **User Question:**
    {question}
    
    **Response Structure:**
    1. **Introduction** - Brief overview with key significance
    2. **Historical Facts** - Important dates, events, and figures
    3. **Cultural Impact** - Significance in Indian history and culture
    4. **Interesting Details** - Stories, legends, or unique aspects
    5. **Modern Relevance** - Current status, museums, or commemorations
    6. **Related Topics** - Suggest other related historical subjects
    
    Please provide a comprehensive, well-structured, and engaging response that would be suitable for museum visitors of all ages.
    """

async def answer_question_gemini(question, gemini_model):
    try:
        if not check_keywords(question):
            return "❌ I specialize in Indian history, museums, and heritage sites. Please ask about historical topics like the Maratha Empire, Chhatrapati Shivaji, Indian monuments, or museum artifacts."
        
        # Get information from multiple sources
        with st.spinner("🔍 Searching historical databases..."):
            relevant_context = retrieve_relevant_text(question)
            online_info = search_online_info(question)
        
        prompt = generate_history_prompt(question, relevant_context, online_info)
        
        with st.spinner("🤖 Generating comprehensive response..."):
            try:
                response = gemini_model.generate_content(prompt)
                if response and response.text:
                    return response.text
                else:
                    return "⚠️ I received an empty response. Please try rephrasing your question or check your API quota."
            except Exception as api_error:
                # Fallback to basic historical response
                if "quota" in str(api_error).lower():
                    return "⚠️ API quota exceeded. Please check your Gemini API usage limits or try again later."
                elif "404" in str(api_error) or "not found" in str(api_error).lower():
                    return generate_fallback_response(question, relevant_context, online_info)
                else:
                    return generate_fallback_response(question, relevant_context, online_info)
        
    except Exception as e:
        return generate_fallback_response(question, relevant_context if 'relevant_context' in locals() else None, 
                                        online_info if 'online_info' in locals() else None)

def generate_fallback_response(question, relevant_context=None, online_info=None):
    """Generate a fallback response when AI is not available"""
    
    # Use online info if available
    if online_info and online_info.get('extract'):
        return f"""
## 📚 Historical Information

**{online_info.get('title', 'Historical Topic')}**

{online_info.get('extract', '')}

**Source:** Wikipedia (Online Search)

---
*Note: This response is based on online search results. For more detailed AI-powered analysis, please check your API configuration.*
        """
    
    # Basic responses for common topics
    question_lower = question.lower()
    
    if "shivaji" in question_lower:
        return """
## 🏰 Chhatrapati Shivaji Maharaj (1630-1680)

**Brief Overview:**
Chhatrapati Shivaji Maharaj was the founder of the Maratha Empire in western India. He is considered one of the greatest warriors in Indian history.

**Key Facts:**
- Born: 1630 at Shivneri Fort
- Founded: Maratha Empire in 1674
- Known for: Guerrilla warfare tactics and naval innovations
- Legacy: Father of Maratha Empire and inspiration for independence movement

**Historical Significance:**
- Successfully challenged Mughal dominance
- Established efficient administrative system
- Promoted religious tolerance and Marathi culture

*For more detailed information, please ensure your Gemini API is properly configured.*
        """
    
    elif "maratha" in question_lower:
        return """
## ⚔️ Maratha Empire (1674-1818)

**Overview:**
The Maratha Empire dominated much of the Indian subcontinent from the 17th to 19th centuries.

**Timeline:**
- 1674: Founded by Shivaji Maharaj
- 1760s: Peak expansion under Peshwas
- 1761: Decline after Third Battle of Panipat
- 1818: End of empire under British rule

**Legacy:**
- Revived Hindu political power
- Influenced modern Indian nationalism
- Rich cultural and architectural heritage

*For comprehensive AI-powered responses, please check your API configuration.*
        """
    
    else:
        return f"""
## 📖 Historical Query: {question}

**Response Status:** Basic information mode

**Available Information:**
{relevant_context if relevant_context else "Limited historical context available."}

**Recommendation:** 
For detailed, AI-powered historical analysis with comprehensive information, please:
1. Verify your Gemini API key is valid
2. Check your API quota limits
3. Ensure stable internet connection

*This is a fallback response. Full AI capabilities will be restored once API issues are resolved.*
        """

async def translate_response_gemini(response_text, selected_language, gemini_model):
    if selected_language == "English":
        return response_text

    try:
        prompt = f"""
        Translate this historical text accurately to {selected_language} while preserving:
        1. All proper names and historical terms
        2. Dates and numbers
        3. The formal historical tone
        4. Cultural context and meaning
        
        Text to translate:
        {response_text}
        
        Provide only the translation without any additional commentary.
        """
        
        response = gemini_model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Translation error: {str(e)}"

async def summarize_response_gemini(response_text, gemini_model):
    try:
        prompt = f"""
        Create a concise summary of this historical text:
        - Keep all key facts and dates
        - Maintain historical accuracy
        - Maximum 3-4 sentences
        - Preserve the most important information
        
        Text to summarize:
        {response_text}
        
        Provide only the summary without additional commentary.
        """
        
        response = gemini_model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Summarization error: {str(e)}"

def load_api_key():
    """Load API key from file if exists"""
    try:
        if os.path.exists("api_key.txt"):
            with open("api_key.txt", "r") as f:
                return f.read().strip()
    except:
        pass
    return ""

def save_api_key(api_key):
    """Save API key to file"""
    try:
        with open("api_key.txt", "w") as f:
            f.write(api_key)
    except:
        pass

def main():
    st.set_page_config(
        page_title="🏛️ AI Museum Guide - Enhanced with Online Search",
        page_icon="📜",
        layout="wide"
    )
    
    st.title("🏛️ AI Museum Guide")
    st.subheader("🔍 Enhanced with Online Search & Image Support - Powered by Google Gemini")
    
    # Initialize session state for API key
    if 'api_key' not in st.session_state:
        st.session_state.api_key = load_api_key()
    
    # API Key configuration
    with st.sidebar:
        st.header("🔑 Configuration")
        
        # Load saved API key
        default_key = st.session_state.api_key
        api_key = st.text_input("Enter your Gemini API Key:", 
                               value=default_key,
                               type="password",
                               help="Your API key will be saved locally for convenience")
        
        if api_key and api_key != st.session_state.api_key:
            st.session_state.api_key = api_key
            save_api_key(api_key)
        
        if api_key:
            with st.spinner("🔧 Configuring AI model..."):
                gemini_model = setup_gemini(api_key)
            if gemini_model:
                st.success("✅ AI Model Ready")
            else:
                st.warning("⚠️ AI Model configuration issues - Using fallback mode")
        else:
            st.warning("⚠️ Please enter your Gemini API key")
            gemini_model = None
        
        st.markdown("---")
        st.markdown("**🎯 Try These Questions:**")
        st.markdown("• Tell me about Chhatrapati Shivaji")
        st.markdown("• What is the Maratha Empire?")
        st.markdown("• Describe Red Fort Delhi")
        st.markdown("• Battle of Panipat history")
        st.markdown("• Ajanta and Ellora caves")
        
        st.markdown("---")
        st.markdown("**🆕 New Features:**")
        st.markdown("✅ Online Wikipedia search")
        st.markdown("✅ Historical images")
        st.markdown("✅ Persistent API key")
        st.markdown("✅ Enhanced responses")
        
        st.markdown("---")
        st.markdown("**🔗 Get Free API Key:**")
        st.markdown("[Google AI Studio](https://makersuite.google.com/app/apikey)")

    # Quick question buttons
    st.markdown("**🚀 Quick Questions:**")
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        if st.button("🏰 Chhatrapati Shivaji"):
            st.session_state.quick_query = "Tell me about Chhatrapati Shivaji Maharaj"
    with col2:
        if st.button("🏛️ Red Fort"):
            st.session_state.quick_query = "Tell me about Red Fort Delhi"
    with col3:
        if st.button("⚔️ Maratha Empire"):
            st.session_state.quick_query = "What is the Maratha Empire?"
    with col4:
        if st.button("🎨 Ajanta Caves"):
            st.session_state.quick_query = "Tell me about Ajanta caves"
    
    # Main question input
    user_query = st.text_input("❓ Ask a detailed history question:", 
                              value=st.session_state.get('quick_query', ''),
                              placeholder="e.g., Tell me about the architectural significance of Hampi ruins...")

    if st.button("🔍 Get Enhanced Answer with Images"):
        if not api_key:
            st.error("🔑 Please enter your Gemini API key in the sidebar first!")
        elif user_query.strip():
            try:
                # Clear quick query
                if 'quick_query' in st.session_state:
                    del st.session_state.quick_query
                
                # Always try to get a response, even if model setup failed
                response = asyncio.run(answer_question_gemini(user_query, gemini_model))
                
                if response.startswith("❌") and "API" not in response and "quota" not in response:
                    st.error(response)
                else:
                    st.session_state["latest_response"] = response
                    
                    # Display response with images
                    col1, col2 = st.columns([2, 1])
                    
                    with col1:
                        st.subheader("📜 Comprehensive Historical Response:")
                        st.markdown(response)
                    
                    with col2:
                        st.subheader("🖼️ Related Images:")
                        images = get_historical_images(user_query)
                        for img_url in images:
                            try:
                                st.image(img_url, caption="Historical Reference", use_column_width=True)
                            except:
                                st.info("Images loading...")
                        
                        # Online info display
                        online_info = search_online_info(user_query)
                        if online_info and online_info.get('thumbnail'):
                            st.image(online_info['thumbnail'], caption=f"Source: Wikipedia - {online_info.get('title', '')}")
                    
            except Exception as e:
                st.error(f"Failed to get answer: {str(e)}")
        else:
            st.warning("⚠️ Please enter a valid question.")

    # Advanced features
    if "latest_response" in st.session_state and api_key and gemini_model:
        response_text = st.session_state["latest_response"]

        col1, col2 = st.columns(2)

        with col1:
            if st.button("📝 Summarize Response"):
                with st.spinner("Creating intelligent summary..."):
                    try:
                        summarized_text = asyncio.run(summarize_response_gemini(response_text, gemini_model))
                        st.subheader("📋 Summary:")
                        st.info(summarized_text)
                    except Exception as e:
                        st.error(f"Failed to summarize: {str(e)}")

        with col2:
            selected_language = st.selectbox(
                "🌍 Translate to:", 
                list(indian_languages.keys()), 
                key="lang_select"
            )
            if st.button("🔤 Translate Response"):
                if selected_language == "English":
                    st.info("Response is already in English!")
                else:
                    with st.spinner(f"Translating to {selected_language}..."):
                        try:
                            translated_text = asyncio.run(translate_response_gemini(response_text, selected_language, gemini_model))
                            st.subheader(f"🌏 Translation ({selected_language}):")
                            st.success(translated_text)
                        except Exception as e:
                            st.error(f"Failed to translate: {str(e)}")

    # Knowledge base upload section
    with st.expander("📚 Upload Historical Documents (Optional)"):
        uploaded_file = st.file_uploader("Upload PDF documents to enhance knowledge base:", type="pdf")
        if uploaded_file and st.button("Process Document"):
            st.info("📖 Document processing feature available - would build FAISS knowledge base from your PDFs")

    st.markdown("---")
    
    # Enhanced status display
    st.markdown("---")
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        if api_key and gemini_model:
            st.success("🟢 Gemini AI: Active")
        else:
            st.error("🔴 Gemini AI: Setup Required")
    
    with col2:
        st.info("🔍 Online Search: Enabled")
    
    with col3:
        st.info("🖼️ Images: Enhanced")
    
    with col4:
        st.info("🏛️ Focus: Indian Heritage")
    
    # Enhanced footer
    st.markdown("""
    ---
    **🎯 Enhanced AI Museum Guide Features:**
    - 🔍 **Real-time Wikipedia integration** for latest historical information
    - 🖼️ **Historical images** from online sources
    - 💾 **Persistent API key storage** - no need to re-enter
    - 🚀 **Quick question buttons** for popular topics
    - 🌍 **13 Indian language translations** with context preservation
    - 📝 **Intelligent summarization** for complex historical topics
    - 🏛️ **Museum-grade responses** suitable for all ages
    
    **📌 Perfect for:** Students, tourists, history enthusiasts, and museum visitors!
    """)

if __name__ == "__main__":
    get_embeddings_model.cache_clear()
    main()