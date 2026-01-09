# CineLog — Hybride Mobiele App

## Projectbeschrijving

CineLog is een hybride mobiele applicatie geïnspireerd op Letterboxd.  
De applicatie laat gebruikers toe om films te ontdekken, beoordelen en bespreken, en bevat sociale functionaliteiten zoals watchlists, vrienden en film-aanvragen.

De applicatie maakt gebruik van:
- een zelf ontwikkelde RESTful API
- een externe film-API (TMDB)
- een hybride mobiele frontend gebouwd met Ionic en Capacitor

## Repositories

### Hybride App (Ionic + Capacitor)
Deze repository

### RESTful API
https://github.com/usernaya/WM-RESTfulAPIProjectCineLog-2526

## Belangrijkste functionaliteiten

### Films
- films zoeken en ontdekken
- trending films ophalen via de TMDB API
- filmdetailpagina met poster, beschrijving en ratings

### Ratings & reviews
- films beoordelen met een score van 1 tot 5 sterren
- reviews schrijven en bekijken per film

### Watchlist
- persoonlijke watchlist per gebruiker
- films toevoegen en verwijderen uit de watchlist

### Sociale functies
- andere gebruikers volgen (friends / followers)

### Film-aanvragen
- gebruikers kunnen ontbrekende films aanvragen
- admin kan aanvragen goedkeuren of weigeren
- goedgekeurde aanvragen worden toegevoegd als films

### Accountbeheer
- login en authenticatie
- profielgegevens aanpassen
- profielfoto uploaden via camera of galerij (Capacitor Camera API)
- wachtwoord wijzigen met validatie en foutafhandeling

## API-gebruik

### Eigen RESTful API
- authenticatie
- films
- ratings
- watchlist
- vrienden
- film-aanvragen

### Externe API
- TMDB (The Movie Database) voor films en trending data

## Mobiele installatie en testing

De applicatie werd getest en gebruikt in:
- browser
- Android emulator
- echt Android-toestel

Getest op een Huawei Android toestel.  
De app werd gebouwd en gesynchroniseerd met Capacitor.

## Technologieën

- Ionic
- Vue.js
- Capacitor
- PHP (RESTful API)
- MySQL
- TMDB API
- Camera integratie

## Team

- Aya Boutaarourte  
- Anas Eddaou  

Beide studenten hebben actief bijgedragen aan:
- de hybride mobiele applicatie
- de RESTful API

