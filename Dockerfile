FROM php:7.0-apache
COPY . /var/www/htdocs/
RUN sed -i -e 's/\/var\/www\/html/\/var\/www\/htdocs/example' /etc/apache2/apache2.conf
RUN sed -i -e 's/\/var\/www\/html/\/var\/www\/htdocs/example' /etc/apache2/sites-available/000-default.conf
RUN a2enmod rewrite
RUN usermod -u 1000 www-data
WORKDIR /var/www/htdocs


COPY ./bin/conf/credentials.php ./example/credentials.php

COPY ./bin/conf /tmp
RUN chmod u+x /tmp/entrypoint.sh
ENTRYPOINT ["/tmp/entrypoint.sh"]