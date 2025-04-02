# Database Synchronization Guide

This directory contains scripts for synchronizing the database between different computers.

## Scripts

1. `export-db.bat` - Exports the current database from the Docker container
2. `import-db.bat` - Imports a database dump into a fresh Docker container

## How to Sync Database Between Computers

### On the Source Computer (where you have the data):

1. Run `export-db.bat`
2. The script will create a dump file in the `dumps` directory with format:
   ```
   social_network_YYYYMMDD_HHMM.sql
   ```
3. Copy the generated .sql file to a USB drive or transfer it to the target computer

### On the Target Computer (where you want to copy the data):

1. Create a `dumps` directory in the sync-db folder if it doesn't exist
2. Copy the .sql file from the source computer into the `dumps` directory
3. Run `import-db.bat`
4. Select the dump file when prompted
5. Wait for the import to complete

## Notes

- The import process will stop any running Docker containers
- After import completes, you can start the application normally using start-localhost.bat or start-network.bat
- Database dumps are stored with timestamps to avoid overwriting previous backups
- Make sure Docker is running on both computers before using these scripts

## Troubleshooting

If you encounter errors:

1. Make sure Docker is running
2. Check that no other process is using port 3307
3. Ensure you have enough disk space
4. Verify that the dump file is not corrupted during transfer