FROM mysql:8.0

COPY my.cnf /etc/mysql/conf.d/custom.cnf
RUN chmod 644 /etc/mysql/conf.d/custom.cnf

CMD ["mysqld"]