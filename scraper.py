import json
import re
import os

def parse_markdown_to_games(md_content):
    games = []
    # Suche nach Zeilen, die mit "* " beginnen (Listenpunkte)
    # Beispiel: "* 1 Trait Escape Free Download (v1.15)"
    lines = md_content.split('\n')
    
    seen_titles = set()
    
    for line in lines:
        line = line.strip()
        if line.startswith('* ') and 'Free Download' in line:
            title_text = line[2:].strip()
            
            # Extrahiere Version
            version_match = re.search(r'\(([^)]+)\)', title_text)
            version = version_match.group(1) if version_match else ''
            
            # Bereinige Titel
            clean_title = re.sub(r'\s*Free Download.*$', '', title_text, flags=re.IGNORECASE)
            clean_title = re.sub(r'\s*\([^)]+\)\s*$', '', clean_title).strip()
            
            if not clean_title or clean_title in seen_titles:
                continue
                
            # Erstelle Slug
            slug = clean_title.lower().replace(' ', '-').replace(':', '').replace('\'', '').replace('!', '')
            slug = re.sub(r'[^a-z0-9-]', '', slug)
            
            # URL raten
            url = f"https://steamrip.com/{slug}-free-download/"
            
            games.append({
                'title': clean_title,
                'full_title': title_text,
                'version': version,
                'url': url,
                'slug': slug,
                'image': f"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/0/header.jpg",
                'categories': [],
                'description': clean_title,
                'download_links': [
                    {
                        "label": "SteamRIP Download",
                        "url": url,
                        "host": "SteamRIP"
                    }
                ],
                'size': 'N/A'
            })
            seen_titles.add(clean_title)
            
    return games

def update_json(new_games):
    file_path = 'games-data.json'
    existing_data = []
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            try:
                existing_data = json.load(f)
            except:
                existing_data = []
    
    existing_map = {g['slug']: g for g in existing_data}
    
    final_games = []
    for ng in new_games:
        if ng['slug'] in existing_map:
            eg = existing_map[ng['slug']]
            eg.update({
                'title': ng['title'],
                'full_title': ng['full_title'],
                'version': ng['version'],
                'download_links': ng['download_links'] # Immer aktualisieren
            })
            final_games.append(eg)
        else:
            final_games.append(ng)
            
    # Manuelle Ergänzung für bekannte fehlende Spiele
    manual_games = [
        {
            "title": "Subnautica 2",
            "full_title": "Subnautica 2 Free Download",
            "version": "Early Access",
            "url": "https://steamrip.com/subnautica-2-free-download/",
            "slug": "subnautica-2",
            "image": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1962700/header.jpg",
            "categories": ["Adventure", "Survival"],
            "description": "Subnautica 2",
            "download_links": [
                {
                    "label": "GoFile Download",
                    "url": "https://gofile.io/d/Nc2SFB",
                    "host": "GoFile"
                },
                {
                    "label": "SteamRIP Page",
                    "url": "https://steamrip.com/subnautica-2-free-download/",
                    "host": "SteamRIP"
                }
            ],
            "size": "N/A"
        },
        {
            "title": "Forza Horizon 6",
            "full_title": "Forza Horizon 6 Free Download",
            "version": "Latest",
            "url": "https://steamrip.com/forza-horizon-6-free-download/",
            "slug": "forza-horizon-6",
            "image": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1551360/header.jpg",
            "categories": ["Racing", "Open World"],
            "description": "Forza Horizon 6",
            "download_links": [
                {
                    "label": "SteamRIP Download",
                    "url": "https://steamrip.com/forza-horizon-6-free-download/",
                    "host": "SteamRIP"
                }
            ],
            "size": "N/A"
        }
    ]
    
    for mg in manual_games:
        if mg['slug'] not in existing_map:
            final_games.append(mg)

    # Sortiere alphabetisch
    final_games.sort(key=lambda x: x['title'].lower())
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(final_games, f, ensure_ascii=False, indent=2)
    
    return len(final_games)

if __name__ == "__main__":
    # In der Action würde man hier den HTML/MD Content laden
    # Für dieses Beispiel nutzen wir die bereits extrahierte Datei
    md_file = '/home/ubuntu/upload/steamrip.com_games-list-page_.md'
    if os.path.exists(md_file):
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()
        games = parse_markdown_to_games(content)
        count = update_json(games)
        print(f"Successfully updated {count} games.")
    else:
        print("Markdown file not found.")
