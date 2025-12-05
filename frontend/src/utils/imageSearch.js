// Fetch real historical images from Wikimedia Commons
export const searchHistoricalImages = async (topic, count = 4) => {
  try {
    // Search Wikimedia Commons for images
    const searchTerm = encodeURIComponent(topic);
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${searchTerm}&gsrnamespace=6&gsrlimit=${count + 5}&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=800&format=json&origin=*`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.query || !data.query.pages) {
      console.log('No images found for:', topic);
      return [];
    }
    
    const pages = Object.values(data.query.pages);
    const images = [];
    
    for (const page of pages) {
      if (images.length >= count) break;
      
      if (page.imageinfo && page.imageinfo[0]) {
        const info = page.imageinfo[0];
        
        // Filter: only real images (jpg, png), skip SVG and small images
        if (info.mime && 
            (info.mime.includes('jpeg') || info.mime.includes('png')) &&
            info.width > 400 && info.height > 300) {
          
          images.push({
            url: info.thumburl || info.url,
            width: info.thumbwidth || info.width,
            height: info.thumbheight || info.height,
            title: page.title.replace('File:', '').replace(/\.(jpg|png|jpeg)/i, ''),
            source: 'Wikimedia Commons'
          });
        }
      }
    }
    
    console.log(`Found ${images.length} images for "${topic}"`);
    return images;
    
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
};

// Fallback: Generate topic-specific illustrations if no images found
export const generateFallbackImage = (topic, index) => {
  const seed = topic.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    { primary: '#8B7355', secondary: '#D4AF37' },
    { primary: '#2C3E50', secondary: '#3498DB' },
    { primary: '#8E44AD', secondary: '#E74C3C' },
    { primary: '#16A085', secondary: '#F39C12' }
  ];
  
  const colorSet = colors[(seed + index) % colors.length];
  
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
      <defs>
        <linearGradient id="grad${index}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colorSet.primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colorSet.secondary};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#grad${index})"/>
      <circle cx="400" cy="250" r="150" fill="white" opacity="0.1"/>
      <circle cx="200" cy="150" r="80" fill="white" opacity="0.1"/>
      <circle cx="600" cy="350" r="100" fill="white" opacity="0.1"/>
      <text x="400" y="260" font-family="Georgia, serif" font-size="32" fill="white" text-anchor="middle" opacity="0.9">${topic}</text>
      <text x="400" y="300" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" opacity="0.7">Historical Illustration ${index + 1}</text>
    </svg>
  `)}`;
};

// Get images for a topic - ONLY real images, no fallbacks
export const getTopicImages = async (topic, count = 4) => {
  // Fetch only real images from Wikimedia Commons
  const realImages = await searchHistoricalImages(topic, count * 2);
  
  // Return the best real images found (no generated fallbacks)
  return realImages.slice(0, count);
};
