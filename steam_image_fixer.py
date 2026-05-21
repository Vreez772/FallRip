import json
import requests
import re
import time

def get_steam_id(game_title):
    """Versucht die Steam App ID für einen Spieletitel zu finden"""
    search_url = f"https://store.steampowered.com/api/storesearch/?term={game_title}&l=english&cc=US"
    try:
        response = requests.get(search_url, timeout=10)
        data = response.json()
        if data.get('total') > 0:
            return data['items'][0]['id']
    except:
        pass
    return None

def get_steam_image(app_id):
    """Gibt die URL zum Header-Bild von Steam zurück"""
    if app_id:
        return f"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/{app_id}/header.jpg"
    return None

def fix_images():
    file_path = 'games-data.json'
    with open(file_path, 'r', encoding='utf-8') as f:
        games = json.load(f)
    
    print(f"Fixing images for {len(games)} games...")
    
    updated_count = 0
    # Wir machen nur Stichproben oder begrenzen es, um nicht blockiert zu werden
    for i, game in enumerate(games):
        # Nur wenn das Bild ein Platzhalter ist oder fehlt
        if 'placeholder' in game.get('image', '') or not game.get('image'):
            print(f"[{i}/{len(games)}] Searching image for: {game['title']}")
            app_id = get_steam_id(game['title'])
            if app_id:
                new_image = get_steam_image(app_id)
                game['image'] = new_image
                updated_count += 1
                print(f"  Found: {new_image}")
            
            # Kurze Pause um Steam API nicht zu überlasten
            time.sleep(0.5)
            
            # Speichere alle 50 Updates zwischen
            if updated_count % 50 == 0 and updated_count > 0:
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(games, f, ensure_ascii=False, indent=2)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(games, f, ensure_ascii=False, indent=2)
    
    print(f"Finished! Updated {updated_count} images.")

if __name__ == "__main__":
    fix_images()
