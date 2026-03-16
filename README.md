# FallRip - PC-Spiele direkt downloaden

Eine statische Website zum Durchsuchen und Herunterladen von PC-Spielen. 

![FallRip Screenshot](https://d2xsxph8kpxj0f.cloudfront.net/310519663440677470/Q6rfp8WXtpZKpwvnhmE7hA/titanfall2_hero_custom_05978bbc.webp)

## Features

- 🔍 **Schnelle Suche** - Finde Spiele sofort mit der Echtzeit-Suche
- 🏷️ **Kategorie-Filter** - Filtere nach Action, Adventure, Horror, Indie und mehr
- 📱 **Responsive Design** - Funktioniert auf Desktop, Tablet und Smartphone
- 🌙 **Dark Mode** - Schönes dunkles Design im Obsidian Vault Stil
- ⚡ **Schnell & Stattdisch** - Läuft komplett im Browser, kein Server nötig

## Deployment auf GitHub Pages

1. Erstelle ein neues Repository auf GitHub
2. Lade alle Dateien aus diesem Ordner hoch
3. Gehe zu Repository Settings → Pages
4. Wähle als Source "Deploy from a branch"
5. Wähle den Branch (main/master) und Ordner "/ (root)"
6. Speichern - deine Website ist in wenigen Minuten verfügbar!

## 🔄 Automatische Updates

Die Website kann automatisch aktualisiert werden:

### GitHub Actions Workflow
- **Täglich** werden neue Spiele von SteamRip geholt
- Die `games-data.json` wird automatisch aktualisiert
- Änderungen werden automatisch deployed

### Workflow-Dateien
- `.github/workflows/update.yml` - Automatischer Update-Job
- `update_games.py` - Python-Script zum Scrapen

### Manuelle Updates
Du kannst auch manuell aktualisieren:
1. Gehe zu Actions Tab auf GitHub
2. Wähle "Update Games Data"
3. Klicke "Run workflow"

## Dateistruktur

```
steamfree_website/
├── index.html          # Hauptseite
├── styles.css          # Alle Styles
├── app.js              # JavaScript Logik
├── games-data.json     # Spieldatenbank
├── .nojekyll           # Verhindert Jekyll Processing
└── README.md           # Diese Datei
```

## Lokale Entwicklung

Einfach einen lokalen Server starten:

```bash
# Mit Python
python -m http.server 8080

# Mit Node.js
npx serve

# Mit PHP
php -S localhost:8080
```

Dann im Browser öffnen: `http://localhost:8080`

## Technologie

- **HTML5** - Semantisches Markup
- **CSS3** - Moderne Styles mit CSS Variablen, Flexbox & Grid
- **Vanilla JavaScript** - Keine Frameworks, schnell und leicht
- **Space Grotesk** - Moderne Schriftart von Google Fonts

## Design System

Die Website nutzt ein durchdachtes Farbsystem:

- **Primary Background**: `oklch(0.12 0.008 265)` - Tiefes Dunkelblau
- **Accent**: `oklch(0.62 0.22 35)` - Orange-Rot
- **Text Primary**: `oklch(0.97 0.005 60)` - Helles Weiß
- **Text Muted**: `oklch(0.58 0.01 265)` - Gedämpftes Grau

## Kategorie-Farben

Jede Spielkategorie hat eine eigene Farbe:

| Kategorie | Farbe |
|-----------|-------|
| Action | Orange-Rot |
| Adventure | Blau |
| Horror | Rot |
| Indie | Grün |
| RPG | Lila |
| Strategy | Dunkelblau |

## Lizenz

Dies ist ein inoffizieller Spiegel von [SteamRip.com](https://steamrip.com). 
Alle Spiele und Download-Links gehören den jeweiligen Eigentümern.

---

Made with ❤️ for gamers