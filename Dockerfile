FROM php:7.0-apache

COPY . /var/www/htdocs


RUN apt-get update && apt-get install -y \
	vim \
	git \
	unzip \
	npm

WORKDIR /var/www/htdocs/example

RUN curl -sS https://getcomposer.org/installer | php \
        && mv composer.phar /usr/local/bin/
        #\
        #&& ln -s /usr/local/bin/composer.phar /usr/local/bin/composer




#ENV PATH="~/.composer/vendor/bin:./vendor/bin:${PATH}"


RUN sed -i -e 's@/var/www/html@/var/www/htdocs/example/public@' /etc/apache2/apache2.conf
RUN sed -i -e 's@/var/www/html@/var/www/htdocs/example/public@' /etc/apache2/sites-available/000-default.conf
RUN a2enmod rewrite
RUN usermod -u 1000 www-data

# add credentials php
COPY ./bin/conf/credentials.php /var/www/htdocs/example/config/credentials.php
COPY ./dist /var/www/htdocs/example/dist


#COPY /var/www/htdocs/example /var/www/htdocs/example/vendor




# run entrypoint
COPY ./bin/conf /tmp
RUN chmod u+x /tmp/entrypoint.sh
ENTRYPOINT ["/tmp/entrypoint.sh"]