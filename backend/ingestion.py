"""
Content ingestion pipeline for populating FAISS vector database
with worldwide historical content from Wikipedia and other sources
"""
import requests
import time
from datetime import datetime
from utils import (
    create_vector_db,
    add_to_vector_db,
    save_vector_db,
    load_vector_db,
    get_wikipedia_summary
)

# Comprehensive list of historical topics to populate
HISTORICAL_TOPICS = [
    # Ancient Civilizations
    "Ancient Egypt", "Mesopotamia", "Indus Valley Civilization", "Ancient Greece",
    "Roman Empire", "Byzantine Empire", "Ancient China", "Maurya Empire",
    "Gupta Empire", "Persian Empire", "Phoenician civilization", "Minoan civilization",
    "Mycenaean Greece", "Olmec civilization", "Maya civilization", "Aztec Empire",
    "Inca Empire", "Ancient Japan", "Khmer Empire", "Kingdom of Kush",
    
    # Medieval Period
    "Medieval Europe", "Islamic Golden Age", "Mongol Empire", "Ottoman Empire",
    "Holy Roman Empire", "Feudalism", "Crusades", "Black Death",
    "Hundred Years War", "Byzantine Empire", "Delhi Sultanate", "Vijayanagara Empire",
    "Song Dynasty", "Tang Dynasty", "Medieval India", "Medieval Africa",
    
    # Renaissance & Enlightenment
    "Renaissance", "Age of Enlightenment", "Scientific Revolution", "Protestant Reformation",
    "Italian Renaissance", "Northern Renaissance", "Age of Discovery", "Humanism",
    
    # Modern History (1500-1900)
    "Industrial Revolution", "French Revolution", "American Revolution",
    "Napoleonic Wars", "British Empire", "Spanish Empire", "Age of Imperialism",
    "American Civil War", "Meiji Restoration", "Scramble for Africa",
    "Victorian Era", "Qing Dynasty", "Maratha Empire", "Mughal Empire decline",
    
    # 20th Century
    "World War I", "World War II", "Russian Revolution", "Cold War",
    "Great Depression", "Holocaust", "Atomic Age", "Space Race",
    "Decolonization", "Civil Rights Movement", "Fall of Berlin Wall",
    "Indian Independence Movement", "Chinese Revolution", "Cuban Revolution",
    
    # World Leaders
    "Alexander the Great", "Julius Caesar", "Napoleon Bonaparte", "Winston Churchill",
    "Abraham Lincoln", "George Washington", "Nelson Mandela", "Mahatma Gandhi",
    "Adolf Hitler", "Joseph Stalin", "Mao Zedong", "Genghis Khan",
    "Akbar the Great", "Ashoka", "Shivaji", "Queen Victoria",
    "Cleopatra", "Elizabeth I", "Catherine the Great", "Peter the Great",
    
    # Historical Places & Monuments
    "Great Wall of China", "Taj Mahal", "Pyramids of Giza", "Colosseum",
    "Machu Picchu", "Stonehenge", "Angkor Wat", "Petra",
    "Great Pyramid of Giza", "Acropolis", "Forbidden City", "Versailles",
    "Red Fort", "Qutb Minar", "Hampi", "Ajanta Caves", "Ellora Caves",
    
    # Museums & Cultural Heritage
    "British Museum", "Louvre Museum", "Smithsonian Institution",
    "Metropolitan Museum of Art", "Vatican Museums", "Hermitage Museum",
    "National Museum Delhi", "Egyptian Museum Cairo", "Uffizi Gallery",
    "Prado Museum", "Rijksmuseum", "National Palace Museum Taiwan",
    
    # Wars & Conflicts
    "Battle of Waterloo", "Battle of Gettysburg", "D-Day", "Pearl Harbor",
    "Battle of Stalingrad", "Vietnam War", "Korean War", "Spanish Civil War",
    "Thirty Years War", "Seven Years War", "War of 1812", "Crimean War",
    "First Opium War", "Second Opium War", "Russo-Japanese War",
    "Battle of Panipat", "Battle of Plassey", "Battle of Talikota",
    
    # Cultural Movements & Periods
    "Baroque", "Romanticism", "Impressionism", "Modernism", "Art Deco",
    "Gothic Architecture", "Neoclassicism", "Rococo", "Surrealism",
    "Harlem Renaissance", "Beat Generation", "Hippie Movement",
    
    # Scientific & Technological History
    "Printing Press", "Steam Engine", "Electricity", "Telephone",
    "Radio", "Television", "Computer", "Internet", "Airplane",
    "Automobile", "Photography", "Motion Pictures", "Penicillin",
    
    # Additional Regional History
    "Silk Road", "Spice Trade", "Columbian Exchange", "Transatlantic slave trade",
    "East India Company", "Samurai", "Vikings", "Celts", "Spartans",
    "Mayans", "Incas", "Native Americans", "Aboriginal Australians",
    "Maori culture", "African Kingdoms", "Songhai Empire", "Mali Empire",
    
    # Philosophy & Religion
    "Buddhism", "Christianity", "Islam", "Hinduism", "Judaism",
    "Confucianism", "Taoism", "Ancient Greek philosophy", "Stoicism",
    "Renaissance humanism", "Existentialism"
]

def fetch_wikipedia_content(topic, max_retries=3):
    """
    Fetch Wikipedia content for a topic
    
    Args:
        topic: Topic name to fetch
        max_retries: Maximum number of retry attempts
        
    Returns:
        str: Combined content or None if failed
    """
    for attempt in range(max_retries):
        try:
            # Get summary
            summary = get_wikipedia_summary(topic)
            
            if not summary:
                print(f"⚠️  No summary found for: {topic}")
                return None
            
            # Combine title and extract
            content = f"# {summary['title']}\n\n{summary['extract']}"
            
            # Add description if available
            if summary.get('description'):
                content += f"\n\n**Description:** {summary['description']}"
            
            # Add source URL
            content += f"\n\n**Source:** {summary['url']}"
            
            return content
            
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"⚠️  Retry {attempt + 1}/{max_retries} for {topic}: {str(e)}")
                time.sleep(2)  # Wait before retry
            else:
                print(f"❌ Failed to fetch {topic} after {max_retries} attempts: {str(e)}")
                return None
    
    return None

def populate_vector_database(topics, index_path, text_map_path, batch_size=50, delay=1.0):
    """
    Populate FAISS vector database with historical content
    
    Args:
        topics: List of topics to fetch
        index_path: Path to save FAISS index
        text_map_path: Path to save text mapping
        batch_size: Number of topics per batch
        delay: Delay between requests (seconds)
        
    Returns:
        tuple: (success_count, failure_count)
    """
    print("\n" + "="*60)
    print("🌍 CONTENT INGESTION PIPELINE")
    print("="*60)
    print(f"\n📚 Total topics to process: {len(topics)}")
    print(f"📦 Batch size: {batch_size}")
    print(f"⏱️  Delay between requests: {delay}s")
    print(f"💾 Index will be saved to: {index_path}")
    print("\n" + "-"*60 + "\n")
    
    all_texts = []
    success_count = 0
    failure_count = 0
    start_time = datetime.now()
    
    # Fetch content for all topics
    for i, topic in enumerate(topics, 1):
        print(f"[{i}/{len(topics)}] Fetching: {topic}...", end=" ")
        
        content = fetch_wikipedia_content(topic)
        
        if content:
            all_texts.append(content)
            success_count += 1
            print("✅")
        else:
            failure_count += 1
            print("❌")
        
        # Add delay to respect API rate limits
        if i < len(topics):
            time.sleep(delay)
        
        # Save intermediate results every batch_size items
        if i % batch_size == 0:
            print(f"\n💾 Intermediate save at {i} topics...")
            if all_texts:
                try:
                    # Check if index exists
                    try:
                        index, text_map = load_vector_db(index_path, text_map_path)
                        if index and text_map:
                            # Add to existing index
                            index, text_map = add_to_vector_db(index, text_map, all_texts)
                        else:
                            # Create new index
                            index, text_map = create_vector_db(all_texts)
                    except:
                        # Create new index if load fails
                        index, text_map = create_vector_db(all_texts)
                    
                    if index and text_map:
                        save_vector_db(index, text_map, index_path, text_map_path)
                        print(f"✅ Saved {len(all_texts)} texts (Total: {index.ntotal} vectors)")
                        all_texts = []  # Clear batch
                except Exception as e:
                    print(f"❌ Failed to save batch: {str(e)}")
            print()
    
    # Final save for remaining texts
    if all_texts:
        print("\n💾 Final save...")
        try:
            try:
                index, text_map = load_vector_db(index_path, text_map_path)
                if index and text_map:
                    index, text_map = add_to_vector_db(index, text_map, all_texts)
                else:
                    index, text_map = create_vector_db(all_texts)
            except:
                index, text_map = create_vector_db(all_texts)
            
            if index and text_map:
                save_vector_db(index, text_map, index_path, text_map_path)
                print(f"✅ Final save complete (Total: {index.ntotal} vectors)")
        except Exception as e:
            print(f"❌ Failed final save: {str(e)}")
    
    # Print summary
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()
    
    print("\n" + "="*60)
    print("📊 INGESTION SUMMARY")
    print("="*60)
    print(f"✅ Successful: {success_count}")
    print(f"❌ Failed: {failure_count}")
    print(f"📈 Success rate: {(success_count/len(topics)*100):.1f}%")
    print(f"⏱️  Total time: {duration:.1f}s ({duration/60:.1f} minutes)")
    print(f"⚡ Average: {duration/len(topics):.2f}s per topic")
    print("="*60 + "\n")
    
    return success_count, failure_count

def run_ingestion_pipeline(config):
    """
    Run the complete ingestion pipeline
    
    Args:
        config: Configuration object with paths
    """
    import os
    
    # Create data directory if needed
    os.makedirs(os.path.dirname(config.FAISS_INDEX_FILE), exist_ok=True)
    
    # Determine topics to fetch
    topics_to_fetch = HISTORICAL_TOPICS[:config.WIKIPEDIA_ARTICLES_LIMIT]
    
    print(f"\n🚀 Starting content ingestion for {len(topics_to_fetch)} topics...")
    
    # Run population
    success, failure = populate_vector_database(
        topics_to_fetch,
        config.FAISS_INDEX_FILE,
        config.TEXT_MAP_FILE,
        batch_size=50,
        delay=1.0  # 1 second delay to respect Wikipedia API
    )
    
    if success > 0:
        print(f"✅ Ingestion complete! {success} topics successfully added to vector database.")
    else:
        print("❌ Ingestion failed. No content was added.")
    
    return success, failure

if __name__ == "__main__":
    # Can be run standalone for testing
    from config import get_config
    
    config = get_config()
    run_ingestion_pipeline(config)
