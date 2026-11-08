# Shared todo lists

Todo lists are stored as one shared collection without user accounts because the application has no identity or authentication model. This keeps the app simple, but anyone who can reach it can view and change the same lists; splitting data by user later will require an explicit migration.
