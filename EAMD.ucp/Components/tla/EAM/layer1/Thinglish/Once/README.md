Go to the folder where the certificate will be located.

~~~
cd /path
~~~

The tls module provides an implementation of the Transport Layer Security (TLS) and Secure Socket Layer (SSL) protocols that is built on top of OpenSSL.
The TLS/SSL is a public/private key infrastructure (PKI). For most common cases, each client and server must have a private key.

Use of the OpenSSL command-line interface to generate a 2048-bit RSA private key:

~~~
openssl genrsa -out key-name.pem 2048
~~~

With TLS/SSL, all servers (and some clients) must have a certificate. The first step to obtaining a certificate igits to create a Certificate Signing Request (CSR) file.

The OpenSSL command-line interface can be used to generate a CSR for a private key:

~~~
openssl req -new -sha256 -key key-name.pem -out csr-name.pem
~~~

Once the CSR file is generated, it can either be used to generate a self-signed certificate.

Creating a self-signed certificate using the OpenSSL command-line interface:

~~~
openssl x509 -req -in csr-name.pem -signkey key-name.pem -out cert-key.pem
~~~

Once the certificate is generated, it can be used to generate a .pfx or .p12 file:

~~~
openssl pkcs12 -export -in cert-name.pem -inkey key-name.pem -certfile cert-name.pem -out name.pfx
~~~

Problems with Chrome
https://stackoverflow.com/questions/7580508/getting-chrome-to-accept-self-signed-localhost-certificate