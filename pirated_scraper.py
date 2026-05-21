import json
import requests
from bs4 import BeautifulSoup
import re
import time
import xml.etree.ElementTree as ET

def get_games_from_sitemap():
    sitemap_url = "https://piratedgame.com/post-sitemap.xml"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    games = []
    try:
        print(f"Fetching sitemap: {sitemap_url}")
        response = requests.get(sitemap_url, headers=headers, timeout=20)
        # Wir nutzen Regex um die URLs aus dem XML zu extrahieren, falls ET fehlschlägt
        urls = re.findall(r'<loc>(https://piratedgame\.com/.*?-free-download/)</loc>', response.text)
        
        for loc in urls:
            slug = loc.split('/')[-2]
            title = slug.replace('-free-download', '').replace('-', ' ').title()
            
            games.append({
                'title': title,
                'full_title': f"{title} Free Download",
                'version': "",
                'url': loc,
                'slug': slug,
                'image': f"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/0/header.jpg",
                'categories': [],
                'description': title,
                'download_links': [
                    {
                        "label": "Direct Download",
                        "url": loc,
                        "host": "PiratedGame"
                    }
                ],
                'size': 'N/A'
            })
    except Exception as e:
        print(f"Error scraping sitemap: {e}")
        
    return games

def update_data():
    print("Starting scrape from piratedgame.com...")
    new_games = get_games_from_sitemap()
    
    # Manuelle Ergänzung für Subnautica 2 (da es brandneu ist und vielleicht noch nicht in der Sitemap)
    subnautica_2 = {
        "title": "Subnautica 2",
        "full_title": "Subnautica 2 Free Download (v0.10.0.113109 + Co-op)",
        "version": "v0.10.0.113109 + Co-op",
        "url": "https://piratedgame.com/subnautica-2-free-download/",
        "slug": "subnautica-2-free-download",
        "image": "https://piratedgame.com/wp-content/uploads/2026/05/Subnautica-2-5-scaled.jpg",
        "categories": ["Action", "Adventure"],
        "description": "Subnautica 2",
        "download_links": [
            {
                "label": "Direct Download",
                "url": "https://piratedgame.com/subnautica-2-free-download/",
                "host": "PiratedGame"
            }
        ],
        "size": "14.6 GB"
    }
    
    # Prüfen ob Subnautica 2 schon da ist, sonst hinzufügen
    found_sub = False
    for g in new_games:
        if "subnautica-2" in g['slug']:
            found_sub = True
            break
    if not found_sub:
        new_games.append(subnautica_2)

    print(f"Total games to update: {len(new_games)}")
    
    file_path = 'games-data.json'
    # Wir überschreiben die Datei komplett, wie vom Nutzer gewünscht ("alles neu")
    new_games.sort(key=lambda x: x['title'].lower())
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(new_games, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully updated {len(new_games)} games from piratedgame.com.")

if __name__ == "__main__":
    update_data()
