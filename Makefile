prod:
	yum install -y oracle-instantclient-release-el8
	yum install -y oracle-instantclient-basic
	sudo sh -c "echo /usr/lib/oracle/21/client64/lib > /etc/ld.so.conf.d/oracle-instantclient.conf"
	sudo ldconfig