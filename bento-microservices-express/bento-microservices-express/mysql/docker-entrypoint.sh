#!/bin/bash
set -e

# Set correct permissions for MySQL config
chmod 644 /etc/mysql/conf.d/custom.cnf

# Execute the original entrypoint
exec docker-entrypoint.sh "$@"