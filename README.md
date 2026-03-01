TaskManager - Projet_react_symfony Dorian FRANOT 01/03/2026

Bienvenue sur TaskManager !
Gérez facilement vos tâches quotidiennes et améliorez votre productivité grâce à une interface intuitive et une API sécurisée.

1 - Fonctionnalités

📌 Créez et gérez vos tâches personnelles

🕒 Ajoutez une date et une heure à chaque tâche

✏️ Modifiez ou supprimez vos tâches à tout moment

🛡️ Gestion des utilisateurs et des tâches pour les administrateurs

🔒 Sécurité renforcée avec authentification JWT

2 - Prérequis

Avant d’installer le projet, assurez-vous d’avoir :

PHP >= 8.1
Composer
Node.js >= 18 et npm ou yarn
MySQL
Symfony

3 - Installation

1. Cloner le projet
   git clone https://votre-repo-git.com/projet_react_symfony.git
   cd projet_react_symfony

2. Installer le back-end (Symfony)
   cd backend
   composer install

3. Installer le front-end (React)
   cd ../frontend
   npm install

# ou avec yarn

yarn install

4. Configurer la base de données
   Créez la base de données et exécutez les migrations :
   cd ../backend
   php bin/console doctrine:database:create
   php bin/console doctrine:migrations:migrate

4 - Variables d'environnement

Créez un fichier .env.local à la racine du back-end avec les variables suivantes :

# Symfony

APP_ENV=dev
APP_SECRET=VOTRE_CLE_SECRETE_SYMFONY
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=VOTRE_PASSPHRASE_JWT
DATABASE_URL="mysql://db_user:db_password@127.0.0.1:3306/db_name?serverVersion=8.0"

⚠️ Ne jamais versionner les fichiers .env.local contenant vos secrets.

5 - Structure du projet

projet_react_symfony/
├─ backend/ # Back-end Symfony
│ ├─ config/ # Configuration (routes, services, security)
│ ├─ src/
│ │ ├─ Controller/ # Contrôleurs API
│ │ ├─ Entity/ # Entités Doctrine
│ │ ├─ Repository/ # Repositories
│ │ ├─ Security/ # Authentification JWT
│ │  
│ ├─ migrations/ # Migrations Doctrine
│ ├─ public/ # Point d’entrée web
│  
├─ frontend/ # Front-end React
│ ├─ src/
│ │ ├─ api/ # Axios / appels API
| | ├─ auth/ # Gestion du token utilisateur
│ │ ├─ components/ # Composants réutilisables
│ │ ├─ pages/ # Pages (routes)
│ │ ├─ css/ # Styles globaux
│ │  
│ ├─ public/ # Fichiers statiques
│ └─ README.md

6 - Captures d'écran

# Page d'accueil

![Accueil Page](frontend/public/screenshots/accueil.jpg)

# Page de login

![Login Page](frontend/public/screenshots/login.jpg)

# Page de register

![Register Page](frontend/public/screenshots/register.jpg)

# Dashboard (Admin)

![Dashboard Admin](frontend/public/screenshots/dashboard.jpg)

# Dashboard (Utilisateur)

![Dashboard User](frontend/public/screenshots/dashboard_user.jpg)

# Liste des tâches (Utilisateur)

![My Tasks Page](frontend/public/screenshots/my-tasks.jpg)

# Liste des utilisateurs (Admin)

![List Users Page](frontend/public/screenshots/list_user.jpg)

# Liste des tâches (Admin)

![List Tasks Page](frontend/public/screenshots/list_tasks.jpg)

# Exemple de gestion du chargement

![Loading Example](frontend/public/screenshots/loading.jpg)
