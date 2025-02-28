# News Scraper API
Une API REST construite avec NestJS qui scrape et stocke des articles de différentes sources d'actualités.

## Fonctionnalités

- Scraping automatique d'articles depuis Hacker News
- Mise en cache avec Redis
- Pagination, filtre de titre ainsi que de source
- Nettoyage automatique des anciens articles
- API RESTful

## 📋 Prérequis

- Node.js
- MySQL
- Redis
- pnpm

## 🛠️ Installation

1. **Cloner le repository**
```bash
git clone git@github.com:upnico9/news-scrapper.git
cd news-scraper
```

2. **Installer les dépendances**
```bash
pnpm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
```

Configurer le fichier `.env` :
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=news

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

4. **Démarrer les services**
```bash
# MySQL
sudo service mysql start

# Redis
sudo service redis-server start
```

6. **Lancer l'application**
```bash
pnpm run db:init
pnpm run start:dev
```

## 📚 API Documentation


## Architecture

```
src/
├── articles/           # Gestion des articles
│   ├── dto/           # Data Transfer Objects
│   ├── entities/      # Entités de base de données
│
├── scraper/           # Service de scraping
└── database/          # Configuration DB
```

## Tâches automatisées

| Tâche | Fréquence |
|-------|-----------|
| Scraping des articles | Toutes les 10 minutes |
| Nettoyage des articles | Tous les jours à minuit |

## Problèmes Identifiés sur un plus gros scrapping 

### 1. Performance des Requêtes

**Problème** : Les requêtes de récupération d'articles peuvent devenir lentes avec l'augmentation du volume de données.

**Solutions** :
- Mise en place du cache Redis pour les requêtes fréquentes
- Pagination des résultats
- Indexation de la base de données sur les colonnes fréquemment utilisées (titre, source, date de publication)
- Nettoyage automatique des articles de plus de 30 jours
- Archivage des anciens articles dans une table séparée (?)
- Sharding des bases de données (?)


## Solution Implémentée

1. **Cache Redis**
   - Réduit la charge sur la base de données
   - Améliore le temps de réponse pour les requêtes fréquentes
   - TTL de 5 minutes pour garantir la fraîcheur des données

2. **Nettoyage Automatique**
   - Supprime les articles de plus de 30 jours
   - Maintient la performance de la base de données
   - Exécution quotidienne à minuit



## Conclusion

Toujours dans une démarche de m'améliorer je serai ravi de discuter de mes difficultés, des choses que j'aurai pu mieux faire.

Une collection POSTMAN est glissée dans le répository.

Un swagger est disponible au lancement du serveur directement sur host /api


Bonne lecture :)