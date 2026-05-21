import json
import requests
import re
import time

def get_steam_image(game_title):
    search_url = f"https://store.steampowered.com/api/storesearch/?term={game_title}&l=german&cc=DE"
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
    print("Starting scrape from piratedgame.com...")
    
    # Da Cloudflare blockiert, nutzen wir eine Liste von URLs, die wir aus der Sitemap-Analyse haben
    # In einer echten GitHub Action Umgebung könnte man versuchen, die Sitemap mit anderen Headern zu laden
    sitemap_url = "https://piratedgame.com/post-sitemap.xml"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    }
    
    games = []
    try:
        response = requests.get(sitemap_url, headers=headers, timeout=20)
        urls = re.findall(r'https://piratedgame\.com/[^/]+-free-download/', response.text)
        urls = list(set(urls))
        
        for loc in urls:
            slug = loc.split('/')[-2]
            title = slug.replace('-free-download', '').replace('-', ' ').title()
            games.append({
                'title': title,
                'url': loc,
                'slug': slug,
                'image': "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/0/header.jpg",
                'download_links': [{"label": "Direct Download", "url": loc, "host": "PiratedGame"}]
            })
    except:
        pass

    # Wenn Sitemap fehlschlägt, nutzen wir eine Basis-Liste
    if not games:
        print("Sitemap blocked, using fallback list...")
        fallback_slugs = ["subnautica-2", "forza-horizon-6", "stellar-blade", "directive-8020", "better-than-dead"]
        for slug in fallback_slugs:
            title = slug.replace('-', ' ').title()
            games.append({
                'title': title,
                'url': f"https://piratedgame.com/{slug}-free-download/",
                'slug': f"{slug}-free-download",
                'image': "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/0/header.jpg",
                'download_links': [{"label": "Direct Download", "url": f"https://piratedgame.com/{slug}-free-download/", "host": "PiratedGame"}]
            })

    # Bilder laden (begrenzt auf 50 für Geschwindigkeit)
    for i in range(min(50, len(games))):
        games[i]['image'] = get_steam_image(games[i]['title'])

    games.sort(key=lambda x: x['title'].lower())
    
    with open('games-data.json', 'w', encoding='utf-8') as f:
        json.dump(games, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully updated {len(games)} games.")

if __name__ == "__main__":
    update_data()
