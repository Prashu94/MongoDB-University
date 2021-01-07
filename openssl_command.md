# OpenSSL commands

### To create a private key, use openssl genrsa command:

```
openssl genrsa 2048 > ca-key.pem
```

```
openssl genrsa -out ca-key.pem 2048
```

### Generate a self-signed root certificate

```
openssl req -x509 -days 365 -nodes -new -key ca-key.pem -out ca.pem
```

* -new: use new to show that you’re intending to create a certificate request


### Create server certificate, remove pass phrase and then sign it
* To create a CSR, use openssl req command:
Create a private key and generate a certificate request from it

	```
	openssl req -days 365 -nodes -newkey rsa:2048 
			-keyout server-key.pem -out server-req.pem
	```

* To remove the pass phrase of server private key:

	```
	openssl rsa -in server-key.pem -out server-key.pem
	```

* To sign a certificate, use openssl x509 command: 
 - The x509 utility can be used to sign certificates and requests: it can thus behave like a "mini CA".

	```
	openssl x509 -req -in server-req.pem -days 365 
			-CA ca.pem -CAkey ca-key.pem -set_serial 01 -out server-cert.pem
	```	
	
	* -req : show that -in option is a request
	* -CAkey: show that -CA option doesn’t include private key and append it in this option


### Create client certificate, remove pass phrase and then sign it
* follow the same procedure as server certificate

### References
* [MySQL Document](https://dev.mysql.com/doc/refman/8.0/en/creating-ssl-files-using-openssl.html)
* [OpenSSL Document] (https://www.openssl.org/docs/)
