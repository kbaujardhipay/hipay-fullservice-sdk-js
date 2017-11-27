FROM php:7.0-apache

COPY . /var/www/htdocs

RUN apt-get update && apt-get install -y \
	git \
	unzip \
	npm


WORKDIR /var/www/htdocs/example

RUN curl -sS https://getcomposer.org/installer | php \
        && mv composer.phar /usr/local/bin/
        # \
        # && ln -s /usr/local/bin/composer.phar /usr/local/bin/composer



RUN sed -i -e 's@/var/www/html@/var/www/htdocs/example/public@' /etc/apache2/apache2.conf
#RUN sed -i -e 's@/var/www/html@/var/www/htdocs/example/public@' /etc/apache2/sites-available/000-default.conf
#COPY ./bin/conf/76969781-172.17.0.2.crt /etc/ssl/certs/76969781-172.17.0.2.crt
#COPY ./bin/conf/76969781-172.17.0.2.key /etc/ssl/certs/76969781-172.17.0.2.key
#RUN openssl req -x509 -newkey rsa:4096 -keyout /etc/ssl/certs/key.pem -out /etc/ssl/certs/cert.pem -days 365 -subj '/CN=localhost'
RUN apt-get update && \
    apt-get install -y openssl && \
    openssl genrsa -des3 -passout pass:x -out server.pass.key 2048 && \
    openssl rsa -passin pass:x -in server.pass.key -out /etc/ssl/certs/server.key && \
    rm server.pass.key && \
    openssl req -new -key /etc/ssl/certs/server.key -out server.csr \
        -subj "/CN=172.17.0.2" && \
    openssl x509 -req -days 365 -in server.csr -signkey /etc/ssl/certs/server.key -out /etc/ssl/certs/server.crt
COPY ./bin/conf/vhost.conf /etc/apache2/sites-available/000-default.conf

RUN a2enmod rewrite
RUN a2enmod ssl
RUN usermod -u 1000 www-data

WORKDIR /var/www/htdocs

# add credentials php
COPY ./bin/conf/credentials.php /var/www/htdocs/example/config/credentials.php
COPY ./bin/conf/credentials_public.json /var/www/htdocs/example/public/credentials_public.json
COPY ./dist /var/www/htdocs/example/public/lib/hipay-fullservice-sdk

# run entrypoint
COPY ./bin/conf /tmp
RUN chmod u+x /tmp/entrypoint.sh
ENTRYPOINT ["/tmp/entrypoint.sh"]