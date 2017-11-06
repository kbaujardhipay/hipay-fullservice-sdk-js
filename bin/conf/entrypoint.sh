#!/bin/bash

cd /var/www/htdocs/example/public/lib
#php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
#php -r "if (hash_file('SHA384', 'composer-setup.php') === '$(curl -q https://composer.github.io/installer.sig)') { echo 'Installer verified' . PHP_EOL; } else { echo 'Installer corrupt' . PHP_EOL;}"
#php composer-setup.php
#php -r "unlink('composer-setup.php');"

composer.phar self-update
composer.phar install
cd vendor
ls -al

npm install
#cd ..

sudo chown -R www-data:www-data /var/www/htdocs/example/public
sudo chmod -R a+rw /var/www/htdocs/example/public

################################################################################
# IF CONTAINER IS KILLED, REMOVE PID
################################################################################
if [ -f /var/run/apache2/apache2.pid ]; then
rm -f /var/run/apache2/apache2.pid
fi

exec apache2-foreground




echo ""
echo "Setup completed! Do not forget to add your HiPay Fullservice credentials into the example/credentials.php file."
