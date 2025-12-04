"""
Quick start script to populate FAISS database with essential historical content
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ingestion import populate_vector_database
from config import get_config

# Essential topics for quick start (50 topics)
QUICK_START_TOPICS = [
    "Ancient Egypt", "Roman Empire", "Ancient Greece", "Mesopotamia",
    "Indus Valley Civilization", "Maya civilization", "Aztec Empire", "Inca Empire",
    "Medieval Europe", "Byzantine Empire", "Ottoman Empire", "Mongol Empire",
    "Renaissance", "Industrial Revolution", "French Revolution", "American Revolution",
    "World War I", "World War II", "Cold War", "Great Depression",
    "Alexander the Great", "Julius Caesar", "Napoleon Bonaparte", "Winston Churchill",
    "Abraham Lincoln", "Mahatma Gandhi", "Nelson Mandela", "Cleopatra",
    "Great Wall of China", "Taj Mahal", "Pyramids of Giza", "Colosseum",
    "Stonehenge", "Machu Picchu", "Petra", "Angkor Wat",
    "Silk Road", "Crusades", "Black Death", "Holocaust",
    "Maurya Empire", "Gupta Empire", "Mughal Empire", "Maratha Empire",
    "British Empire", "Spanish Empire", "Persian Empire", "Chinese Empire",
    "Battle of Waterloo", "D-Day"
]

if __name__ == "__main__":
    config = get_config()
    
    print("\n" + "="*60)
    print("🚀 QUICK START: Populating Vector Database")
    print("="*60)
    print(f"\n📚 Loading {len(QUICK_START_TOPICS)} essential historical topics...")
    print("⏱️  This will take approximately 2-3 minutes...\n")
    
    success, failure = populate_vector_database(
        QUICK_START_TOPICS,
        config.FAISS_INDEX_FILE,
        config.TEXT_MAP_FILE,
        batch_size=25,
        delay=0.5  # Faster for quick start
    )
    
    print(f"\n✅ Quick start complete!")
    print(f"   Successfully loaded: {success}/{len(QUICK_START_TOPICS)} topics")
    print(f"   You can now restart the backend server.\n")
