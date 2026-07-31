# How to run the project

## Start the local server

Open a terminal in the project folder and run:

```bash
php -S localhost:8000 server.php
```

Keep that terminal open while using the website. The `server.php` router is required for the clean page URLs and the admin access checks.

Open [http://localhost:8000](http://localhost:8000) in your browser.

## Available pages

| Page | URL |
| --- | --- |
| Public home page | [http://localhost:8000/](http://localhost:8000/) |
| Admin login | [http://localhost:8000/admin-login](http://localhost:8000/admin-login) |
| Admin management | [http://localhost:8000/admin-management](http://localhost:8000/admin-management) |
| Admin profile/dashboard | [http://localhost:8000/profiles](http://localhost:8000/profiles) |

`/admin-management` and `/profiles` are protected pages. If you are not logged in, they automatically redirect you to `/admin-login`. Sign in with an existing administrator email address and password to access the admin controls.

## Database setup

Make sure the project root contains a `.env` file with the correct MySQL database settings before logging in:

```env
DB_HOST=localhost
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASS=your_database_password
```

The `users` table must contain `id`, `email`, `password_hash`, and `created_at`. Administrator passwords must be stored as hashes created with PHP's `password_hash()` function.
