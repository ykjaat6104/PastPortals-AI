"""
Historical content utilities and domain validation
"""
import re

# Comprehensive historical keywords - worldwide coverage
HISTORY_KEYWORDS = {
    # General historical terms
    "museum", "monument", "artifact", "historical", "history", "heritage", "exhibit",
    "dynasty", "emperor", "king", "queen", "ruler", "reign", "kingdom", "empire",
    "battle", "war", "treaty", "conquest", "rebellion", "revolution", "civilization",
    "ancient", "medieval", "renaissance", "colonial", "pre-modern", "modern", "contemporary",
    "archaeology", "excavation", "ruins", "palace", "temple", "cathedral", "mosque",
    
    # World historical figures
    "alexander", "caesar", "napoleon", "churchill", "gandhi", "mandela", "lincoln",
    "cleopatra", "hannibal", "genghis khan", "charlemagne", "leonardo da vinci",
    "shakespeare", "galileo", "copernicus", "martin luther", "joan of arc",
    "confucius", "buddha", "muhammad", "jesus", "moses", "socrates", "plato", "aristotle",
    "washington", "jefferson", "roosevelt", "stalin", "hitler", "mao", "castro",
    
    # Indian historical figures
    "shivaji", "akbar", "ashoka", "buddha", "chandragupta", "harsha", "prithviraj",
    "tipu sultan", "rani lakshmibai", "subhas chandra bose", "bhagat singh",
    "nehru", "patel", "bose", "tilak", "rana pratap", "krishna deva raya",
    
    # World civilizations and empires
    "roman empire", "byzantine", "ottoman", "persian", "chinese empire", "mayan",
    "aztec", "inca", "egyptian", "mesopotamian", "indus valley", "greek",
    "british empire", "french empire", "spanish empire", "portuguese empire",
    "mongol empire", "holy roman empire", "russian empire", "japanese empire",
    
    # Indian civilizations
    "maurya", "gupta", "chola", "mughal", "maratha", "vijayanagara", "delhi sultanate",
    "pallava", "chalukya", "rashtrakuta", "hoysala", "pandya", "satavahana",
    
    # World historical events
    "world war", "french revolution", "american revolution", "industrial revolution",
    "crusades", "black death", "renaissance", "reformation", "cold war",
    "fall of rome", "fall of constantinople", "discovery of america",
    "holocaust", "pearl harbor", "hiroshima", "d-day", "waterloo", "trafalgar",
    
    # Indian historical events
    "independence movement", "sepoy mutiny", "partition", "salt march", "quit india",
    "battle of panipat", "battle of plassey", "jallianwala bagh", "dandi march",
    "civil disobedience", "non-cooperation", "khilafat movement",
    
    # Historical places worldwide
    "colosseum", "great wall", "pyramids", "stonehenge", "machu picchu",
    "petra", "angkor wat", "acropolis", "versailles", "forbidden city",
    "sistine chapel", "notre dame", "westminster", "kremlin", "white house",
    "eiffel tower", "statue of liberty", "berlin wall", "parthenon",
    
    # Indian historical places
    "taj mahal", "red fort", "qutub minar", "hampi", "ajanta", "ellora", "khajuraho",
    "sanchi", "fatehpur sikri", "golden temple", "meenakshi temple", "konark",
    "victoria memorial", "gateway of india", "india gate", "charminar",
    
    # Historical periods and eras
    "stone age", "bronze age", "iron age", "classical period", "dark ages",
    "middle ages", "age of exploration", "enlightenment", "victorian era",
    "roaring twenties", "great depression", "atomic age", "space age",
    
    # Wars and conflicts
    "hundred years war", "thirty years war", "seven years war", "napoleonic wars",
    "american civil war", "boer war", "vietnam war", "korean war", "gulf war",
    "crimean war", "opium wars", "russo-japanese war",
    
    # Cultural movements
    "humanism", "baroque", "romanticism", "impressionism", "modernism",
    "surrealism", "cubism", "art deco", "gothic", "neoclassical"
}

# Time period patterns
TIME_PATTERNS = [
    r'\b\d{1,4}\s*(BC|BCE|AD|CE)\b',
    r'\b\d{1,2}(st|nd|rd|th)\s+century\b',
    r'\b(ancient|medieval|renaissance|colonial|pre-modern|modern)\s+(era|period|times)\b',
    r'\b(early|mid|late)\s+\d{4}s?\b',
    r'\byear\s+\d{3,4}\b'
]

# Historical query patterns
HISTORICAL_QUERY_PATTERNS = [
    r'\bwho\s+(was|were|ruled|conquered|founded|built|established|discovered)\b',
    r'\bwhen\s+(was|were|did)\b.+(built|founded|established|happen|occur|take\s+place)\b',
    r'\bwhat\s+happened\b.+(in|during|at)\b',
    r'\bwhy\s+did\b.+(war|battle|conflict|rebellion|revolution)\b',
    r'\bhow\s+did\b.+(empire|kingdom|civilization|dynasty)\b',
    r'\btell\s+me\s+about\b.+(history|historical|ancient|medieval)\b',
    r'\bexplain\s+the\b.+(significance|importance|impact)\s+of\b'
]

def is_historical_question(question):
    """
    Enhanced check for historical questions
    
    Args:
        question: User's question string
        
    Returns:
        bool: True if question is historical, False otherwise
    """
    question_lower = question.lower()
    
    # Check for history keywords
    if any(keyword.lower() in question_lower for keyword in HISTORY_KEYWORDS):
        return True
    
    # Check for time-related patterns
    for pattern in TIME_PATTERNS:
        if re.search(pattern, question_lower, re.IGNORECASE):
            return True
    
    # Check for historical query patterns
    for pattern in HISTORICAL_QUERY_PATTERNS:
        if re.search(pattern, question_lower, re.IGNORECASE):
            return True
    
    return False

def extract_historical_entities(text):
    """
    Extract potential historical entities from text
    
    Args:
        text: Input text
        
    Returns:
        dict: Extracted entities (dates, names, places, events)
    """
    entities = {
        'dates': [],
        'centuries': [],
        'potential_names': [],
        'potential_places': []
    }
    
    text_lower = text.lower()
    
    # Extract dates
    date_pattern = r'\b\d{1,4}\s*(BC|BCE|AD|CE)\b'
    entities['dates'] = re.findall(date_pattern, text, re.IGNORECASE)
    
    # Extract centuries
    century_pattern = r'\b\d{1,2}(st|nd|rd|th)\s+century\b'
    entities['centuries'] = re.findall(century_pattern, text, re.IGNORECASE)
    
    # Extract known keywords
    for keyword in HISTORY_KEYWORDS:
        if keyword in text_lower:
            if keyword.replace(' ', '').isalpha():  # Names/places are alphabetic
                if len(keyword.split()) > 1 or keyword[0].isupper():
                    if 'empire' in keyword or 'kingdom' in keyword:
                        entities['potential_places'].append(keyword)
                    else:
                        entities['potential_names'].append(keyword)
    
    return entities

def generate_history_prompt(question, relevant_context=None, wikipedia_info=None, museum_data=None):
    """
    Generate comprehensive prompt for historical questions
    
    Args:
        question: User's question
        relevant_context: Context from vector database (optional)
        wikipedia_info: Wikipedia data (optional)
        museum_data: Museum artifact data (optional)
        
    Returns:
        str: Formatted prompt for AI
    """
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
    
    if museum_data:
        context_section += f"\n**Museum Artifacts:**\n{len(museum_data)} related artifacts available\n"
    
    return f"""
You are a world-class historian and museum guide with expertise in global history, including ancient civilizations, empires, wars, cultural movements, and historical figures from all continents and time periods.

**Guidelines:**
- Provide accurate, detailed, and engaging responses for any historical topic worldwide
- Include specific dates, names, locations, and historical significance
- Structure your response with clear sections using markdown formatting
- Be educational yet conversational, suitable for museum visitors of all ages
- Include interesting facts, anecdotes, and lesser-known details
- If information is uncertain, acknowledge limitations
- For non-historical questions, politely redirect to historical topics
- Cite sources when using provided context

{context_section}

**User Question:**
{question}

**Response Structure:**
1. **Overview** - Brief introduction with key significance (2-3 sentences)
2. **Historical Context** - Background, time period, and setting  
3. **Key Facts** - Important dates, events, figures, and developments
4. **Cultural Impact** - Significance and influence on society/world
5. **Interesting Details** - Fascinating stories, artifacts, or unique aspects
6. **Modern Legacy** - Current relevance, museums, or commemorations
7. **Related Topics** - Suggest 2-3 other connected historical subjects

Please provide a comprehensive, well-structured, and engaging response suitable for learners visiting a world history museum.
"""

def generate_fallback_response(question, relevant_context=None, wikipedia_info=None):
    """
    Generate response when AI is unavailable
    
    Args:
        question: User's question
        relevant_context: Context from vector database (optional)
        wikipedia_info: Wikipedia data (optional)
        
    Returns:
        str: Markdown-formatted fallback response
    """
    response_parts = []
    
    if wikipedia_info:
        response_parts.append(f"##  {wikipedia_info.get('title', 'Historical Information')}")
        response_parts.append(f"\n{wikipedia_info.get('extract', '')}")
        
        if wikipedia_info.get('url'):
            response_parts.append(f"\n**Source:** [Wikipedia]({wikipedia_info['url']})")
    
    if relevant_context:
        response_parts.append(f"\n## Additional Context\n{relevant_context}")
    
    if not response_parts:
        response_parts.append(f"""
## Historical Query: {question}

I found limited information for this specific query. This could be because:
- The topic requires more specific search terms
- It's a very specialized historical topic
- The information might be in different sources

**Suggestions:**
- Try rephrasing with more specific terms (dates, locations, key figures)
- Include time periods or geographical regions
- Check related historical topics

For detailed AI-powered analysis, please ensure your Gemini API is properly configured.
        """)
    
    return '\n'.join(response_parts)

def get_historical_categories():
    """
    Get list of historical categories for filtering
    
    Returns:
        dict: Categories with keywords
    """
    return {
        'ancient_civilizations': ['mesopotamian', 'egyptian', 'indus valley', 'greek', 'roman', 'mayan', 'aztec', 'inca'],
        'medieval_period': ['medieval', 'middle ages', 'dark ages', 'feudal', 'crusades', 'byzantine', 'ottoman'],
        'renaissance_enlightenment': ['renaissance', 'enlightenment', 'reformation', 'humanism', 'scientific revolution'],
        'modern_history': ['industrial revolution', 'world war', 'cold war', 'colonial', 'independence'],
        'world_leaders': ['emperor', 'king', 'queen', 'president', 'prime minister', 'dictator', 'ruler'],
        'cultural_heritage': ['museum', 'monument', 'heritage', 'artifact', 'temple', 'palace', 'cathedral'],
        'wars_conflicts': ['war', 'battle', 'conflict', 'revolution', 'rebellion', 'siege'],
    }
