# Seed Data for Salmax Backend

This folder contains a database seeding script used to populate the MongoDB database with sample categories and products for local development.

## What it seeds

- 4 sample categories
- 4 sample products

## What it does NOT seed

- Users
- Admin accounts
- Orders
- Sales
- Leads

Admin users should be created manually and assigned roles through MongoDB Atlas during development.

## Production Safety

The seed script is disabled in production environments.

If:

```env
NODE_ENV=production
```

the script will terminate immediately and will not modify the database.

## Run the Seed Script

From the project root:

```bash
npm run seed
```

## Important

The seed script drops the current database before inserting fresh sample data.

Use it only against development databases.

Never run it against production databases.
