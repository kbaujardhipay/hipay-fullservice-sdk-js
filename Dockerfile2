FROM php:7.0-apache

COPY . /var/www/htdocs

ENV LETSENCRYPT_HOME /etc/letsencrypt

# Manually set the apache environment variables in order to get apache to work immediately.
RUN echo $LETSENCRYPT_HOME > /etc/container_environment/LETSENCRYPT_HOME



CMD ["/sbin/my_init"]


# Generate SSL cert
RUN cd /tmp \
    && openssl genrsa -des3 -passout pass:x -out snakeoil.pass.key 2048 \
    && openssl rsa -passin pass:x -in snakeoil.pass.key -out snakeoil.key \
    && openssl req -new -subj "/C=US/ST=California/L=San Francisco/O=Dis/CN=localhost" -key snakeoil.key -out snakeoil.csr \
    && openssl x509 -req -days 365 -in snakeoil.csr -signkey snakeoil.key -out snakeoil.pem \
    && mv ./snakeoil.key /etc/ssl/private/ssl-cert-snakeoil.key \
    && mv ./snakeoil.pem /etc/ssl/certs/ssl-cert-snakeoil.pem \
    && rm -rf /tmp/*




RUN apt-get update && apt-get install -y \
	git \
	unzip \
	python-letsencrypt-apache \
	npm



# configure apache
ADD bin/conf/mods-available/proxy_html.conf /etc/apache2/mods-available/
ADD bin/conf/conf-available/security.conf /etc/apache2/conf-available/
RUN echo "ServerName localhost" >> /etc/apache2/conf-enabled/hostname.conf && \
    a2enmod ssl headers proxy proxy_http proxy_html xml2enc rewrite usertrack remoteip && \
    a2dissite 000-default default-ssl && \
    mkdir -p /var/lock/apache2 && \
    mkdir -p /var/run/apache2


# configure runit
RUN mkdir -p /etc/service/apache
ADD bin/conf/scripts/run_apache.sh /etc/service/apache/run
ADD bin/conf/scripts/init_letsencrypt.sh /etc/my_init.d/
ADD bin/conf/scripts/run_letsencrypt.sh /run_letsencrypt.sh
RUN chmod +x /*.sh && chmod +x /etc/my_init.d/*.sh && chmod +x /etc/service/apache/*



WORKDIR /var/www/htdocs/example

RUN curl -sS https://getcomposer.org/installer | php \
        && mv composer.phar /usr/local/bin/
        # \
        # && ln -s /usr/local/bin/composer.phar /usr/local/bin/composer



RUN sed -i -e 's@/var/www/html@/var/www/htdocs/example/public@' /etc/apache2/apache2.conf
RUN sed -i -e 's@/var/www/html@/var/www/htdocs/example/public@' /etc/apache2/sites-available/000-default.conf
RUN a2enmod rewrite
RUN usermod -u 1000 www-data

WORKDIR /var/www/htdocs

# add credentials php
COPY ./bin/conf/credentials.php /var/www/htdocs/example/config/credentials.php
COPY ./bin/conf/credentials_public.json /var/www/htdocs/example/public/credentials_public.json
COPY ./dist /var/www/htdocs/example/public/lib/hipay-fullservice-sdk

EXPOSE 80
EXPOSE 443
VOLUME [ "$LETSENCRYPT_HOME", "/etc/apache2/sites-available", "/var/log/apache2" ]




# run entrypoint
COPY ./bin/conf /tmp
RUN chmod u+x /tmp/entrypoint.sh
ENTRYPOINT ["/tmp/entrypoint.sh"]