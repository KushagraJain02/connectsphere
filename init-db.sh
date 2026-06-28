#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "postgres" <<-EOSQL
    CREATE DATABASE auth_db;
    CREATE DATABASE user_db;
    CREATE DATABASE post_db;
    CREATE DATABASE connection_db;
    CREATE DATABASE messaging_db;
    CREATE DATABASE notification_db;
    CREATE DATABASE job_db;
EOSQL