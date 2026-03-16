#!/usr/bin/env python3
"""
SteamRip Games Data Updater
Fetches the latest games data from SteamRip and updates games-data.json
"""

import json
import requests
from bs4 import BeautifulSoup
import time
import re
import os

BASE_URL = "https://steamrip.com"
PAGE_URL = BASE_URL + "/page/{}/"

def fetch_games_from_page(page_num):
    """Fetch games from a single page"""
    games = []
    try:
        url = PAGE_URL.format(page_num) if page_num > 1 else BASE_URL
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find all game articles
        articles = soup.select('article')
        
        for article in articles:
            try:
                game = parse_game_article(article)
                if game:
                    games.append(game)
            except Exception as e:
                print(f"Error parsing article: {e}")
                continue
                
    except Exception as e:
        print(f"Error fetching page {page_num}: {e}")
    
    return games

def parse_game_article(article):
    """Parse a single game article"""
    try:
        # Title and link
        title_elem = article.select_one('h2 a, h3 a, .entry-title a')
        if not title_elem:
            return None
            
        title = title_elem.get_text(strip=True)
        url = title_elem.get('href', '')
        
        # Generate slug from URL
        slug = url.rstrip('/').split('/')[-1] if url else title.lower().replace(' ', '-')
        
        # Image
        img_elem = article.select_one('img')
        image = img_elem.get('src', '') or img_elem.get('data-src', '') if img_elem else ''
        
        # Extract version from title (e.g., "(v1.0.0)")
        version_match = re.search(r'\(([^)]+)\)', title)
        version = version_match.group(1) if version_match else ''
        
        # Clean title
        clean_title = re.sub(r'\s*Free Download.*$', '', title, flags=re.IGNORECASE)
        clean_title = re.sub(r'\s*\([^)]+\)\s*$', '', clean_title).strip()
        
        return {
            'title': clean_title,
            'full_title': title,
            'version': version,
            'url': url,
            'slug': slug,
            'image': image,
            'categories': [],
            'description': clean_title,
            'download_links': [],
            'size': ''
        }
    except Exception as e:
        print(f"Error parsing article: {e}")
        return None

def fetch_game_details(game):
    """Fetch detailed info for a single game"""
    if not game.get('url'):
        return game
        
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(game['url'], headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Categories
        cat_elems = soup.select('.post-tags a, .entry-tags a, [rel="tag"]')
        categories = list(set([c.get_text(strip=True) for c in cat_elems if c.get_text(strip=True)]))
        game['categories'] = categories[:5]  # Limit to 5 categories
        
        # Size
        size_match = re.search(r'(\d+(?:\.\d+)?\s*(?:GB|MB))', response.text, re.IGNORECASE)
        if size_match:
            game['size'] = size_match.group(1)
        
        # Download links
        link_elems = soup.select('a[href*="gofile"], a[href*="megadb"], a[href*="buzzheavier"], a[href*="vikingfile"], a[href*="datanodes"], a[href*="pixeldrain"], a[href*="1fichier"]')
        download_links = []
        seen_hosts = set()
        
        for link in link_elems:
            href = link.get('href', '')
            text = link.get_text(strip=True) or 'Download'
            
            # Determine host
            host = 'Unknown'
            for h in ['gofile', 'megadb', 'buzzheavier', 'vikingfile', 'datanodes', 'pixeldrain', '1fichier', 'filecrypt']:
                if h in href.lower():
                    host = h.capitalize()
                    break
            
            if href and host not in seen_hosts:
                download_links.append({
                    'label': text,
                    'url': href,
                    'host': host
                })
                seen_hosts.add(host)
        
        game['download_links'] = download_links[:5]  # Limit to 5 links
        
    except Exception as e:
        print(f"Error fetching details for {game.get('title')}: {e}")
    
    return game

def main():
    """Main function to update games data"""
    print("🚀 Starting SteamRip games update...")
    
    all_games = []
    max_pages = 10  # Adjust based on needs
    
    # Fetch games from multiple pages
    for page in range(1, max_pages + 1):
        print(f"📄 Fetching page {page}...")
        games = fetch_games_from_page(page)
        if not games:
            print(f"⚠️ No games found on page {page}, stopping...")
            break
        all_games.extend(games)
        print(f"   Found {len(games)} games")
        time.sleep(1)  # Be nice to the server
    
    # Remove duplicates based on slug
    seen_slugs = set()
    unique_games = []
    for game in all_games:
        if game['slug'] not in seen_slugs:
            seen_slugs.add(game['slug'])
            unique_games.append(game)
    
    print(f"\n📊 Total unique games found: {len(unique_games)}")
    
    # Optionally fetch details for each game (slow)
    # Uncomment below to fetch details:
    # for i, game in enumerate(unique_games):
    #     print(f"🔍 Fetching details for {game['title']} ({i+1}/{len(unique_games)})...")
    #     unique_games[i] = fetch_game_details(game)
    #     time.sleep(0.5)
    
    # Save to file
    output_file = 'games-data.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(unique_games, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Saved {len(unique_games)} games to {output_file}")
    
    return unique_games

if __name__ == "__main__":
    main()