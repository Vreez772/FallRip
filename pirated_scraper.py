import json
import requests
import re
import time

def get_steam_image(game_title):
    clean_title = game_title.replace('Free Download', '').replace('Build', '').strip()
    search_url = f"https://store.steampowered.com/api/storesearch/?term={clean_title}&l=german&cc=DE"
    try:
        res = requests.get(search_url, timeout=5)
        data = res.json()
        if data.get('items'):
            app_id = data['items'][0]['id']
            return f"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/{app_id}/header.jpg"
    except:
        pass
    return "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/0/header.jpg"

def update_data():
    print("Starting full scrape from piratedgame.com...")
    
    all_urls = []
    # Wir loopen durch alle möglichen Sitemaps
    sitemaps = ["https://piratedgame.com/post-sitemap.xml"] + [f"https://piratedgame.com/post-sitemap{i}.xml" for i in range(2, 7)]
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    for sitemap_url in sitemaps:
        try:
            print(f"Fetching {sitemap_url}...")
            response = requests.get(sitemap_url, headers=headers, timeout=15)
            urls = re.findall(r'https://piratedgame\.com/[^/]+-free-download/', response.text)
            all_urls.extend(urls)
        except:
            print(f"Failed to fetch {sitemap_url}")

    all_urls = list(set(all_urls))
    print(f"Found {len(all_urls)} total games.")
    
    games = []
    for loc in all_urls:
        slug = loc.split('/')[-2]
        title = slug.replace('-free-download', '').replace('-', ' ').title()
        
        # Spezial-Links
        download_links = [{"label": "Direct Download", "url": loc, "host": "PiratedGame"}]
        image = "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/0/header.jpg"
        
        if "subnautica-2" in slug:
            download_links = [
                {"label": "Direct Download (Filekeeper)", "url": "https://filekeeper.net/download", "host": "Filekeeper"},
                {"label": "Direct Download (Datanodes)", "url": "https://datanodes.to/download", "host": "Datanodes"}
            ]
            image = "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1962700/header.jpg"
        elif "forza-horizon-6" in slug:
            image = "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1551360/header.jpg"

        games.append({
            'title': title,
            'url': loc,
            'slug': slug,
            'image': image,
            'download_links': download_links
        })

    games.sort(key=lambda x: x['title'].lower())
    
    with open('games-data.json', 'w', encoding='utf-8') as f:
        json.dump(games, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully updated {len(games)} games.")

if __name__ == "__main__":
    update_data()
