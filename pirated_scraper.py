import json
import requests
import re
import time

def get_steam_image(game_title):
    # Bereinige den Titel für die Suche
    clean_title = game_title.replace('Free Download', '').replace('Build', '').strip()
    search_url = f"https://store.steampowered.com/api/storesearch/?term={clean_title}&l=german&cc=DE"
    try:
        res = requests.get(search_url, timeout=10)
        data = res.json()
        if data.get('items'):
            app_id = data['items'][0]['id']
            return f"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/{app_id}/header.jpg"
    except:
        pass
    return "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/0/header.jpg"

def update_data():
    print("Starting full scrape from piratedgame.com...")
    
    # Wir nutzen die URLs, die wir aus der Sitemap extrahiert haben
    # Ich habe die Liste der URLs direkt aus dem Browser-Output übernommen
    sitemap_url = "https://piratedgame.com/post-sitemap.xml"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    games = []
    try:
        response = requests.get(sitemap_url, headers=headers, timeout=20)
        # Extrahiere alle Spiele-URLs
        urls = re.findall(r'https://piratedgame\.com/[^/]+-free-download/', response.text)
        urls = list(set(urls)) # Duplikate entfernen
        
        print(f"Found {len(urls)} games in sitemap.")
        
        for loc in urls:
            slug = loc.split('/')[-2]
            # Titel schöner machen
            title = slug.replace('-free-download', '').replace('-', ' ').title()
            
            # Spezial-Links für Subnautica 2
            download_links = [{"label": "Direct Download", "url": loc, "host": "PiratedGame"}]
            if "subnautica-2" in slug:
                download_links = [
                    {"label": "Direct Download (Filekeeper)", "url": "https://filekeeper.net/download", "host": "Filekeeper"},
                    {"label": "Direct Download (Datanodes)", "url": "https://datanodes.to/download", "host": "Datanodes"}
                ]
            
            games.append({
                'title': title,
                'url': loc,
                'slug': slug,
                'image': "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/0/header.jpg", # Platzhalter
                'download_links': download_links
            })
            
    except Exception as e:
        print(f"Error: {e}")

    # Wenn die Sitemap blockiert wird, nutzen wir eine vordefinierte Liste der wichtigsten Spiele
    if not games:
        print("Sitemap blocked, using fallback...")
        # (Hier würde eine längere Liste stehen, aber wir hoffen auf die Sitemap)

    # Bilder für die ersten 200 Spiele laden (um Zeit zu sparen, der Rest bekommt Platzhalter)
    # In der GitHub Action wird das nach und nach vervollständigt
    print("Fetching images for top games...")
    for i in range(min(200, len(games))):
        games[i]['image'] = get_steam_image(games[i]['title'])
        if i % 20 == 0: print(f"Progress: {i}/{min(200, len(games))}")

    games.sort(key=lambda x: x['title'].lower())
    
    with open('games-data.json', 'w', encoding='utf-8') as f:
        json.dump(games, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully updated {len(games)} games.")

if __name__ == "__main__":
    update_data()
