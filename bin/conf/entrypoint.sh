#!/bin/bash

chown -R www-data:www-data /var/www/htdocs
chmod -R a+rw /var/www/htdocs

################################################################################
# IF CONTAINER IS KILLED, REMOVE PID
################################################################################
if [ -f /var/run/apache2/apache2.pid ]; then
rm -f /var/run/apache2/apache2.pid
fi

exec apache2-foreground