# mml.demo

This repository contaibns a mocked demo backend for testing purpose of the android and ios app of the [mml.project](https://we-kode.github.io/mml.project/). You can use this by running it in a docker container to test the app.

## Prerequites

This project provides a ready to go [docker image]() you can use. If you want to use docker-compose you can [download]() the provided file and configure the [.env]() file. Before you can use the backend you must complete following steps.

### Port

On the host machine you should provide one `SSL_PORT` which can be reached on your mneeds in your local network or from outside. This port will be mapped to the port 3001 in the docker file.

### SSL/TLS certificates

The [mml.app]() allows only secure backend connections. So we need a certificate for your macheine where you run the demo backend. Please provide a `.key` and a `.crt` file.
The `VOL_CERTS` definess the path to the folder, where the cert is on the host machine and the `CERT_NAME` defines the name of the certificate without the extension.

### QR code

On the registration page you can scan the static qr code for the demo environment. Since the domain of the backend will be individual you need to modify the qr code.

1. Change your domain and port in the string on the endpoint key.

```
{"token":"97hPw7RlURec4g48Esxt-H0K-nc6oWMPtf-Ul8Y9oWb8smae5623cGpMTd3yEMnt","endpoint":"172.23.4.74:5050","appKey":"afc78546-2746-46e9-ae4c-10b52bfa9ff4"}
```

2. Encode the above modified string to a base64 string, e.g.

```
eyJ0b2tlbiI6Ijk3aFB3N1JsVVJlYzRnNDhFc3h0LUgwSy1uYzZvV01QdGYtVWw4WTlvV2I4c21hZTU2MjNjR3BNVGQzeUVNbnQiLCJlbmRwb2ludCI6IjE3Mi4yMy40Ljc0OjUwNTAiLCJhcHBLZXkiOiJhZmM3ODU0Ni0yNzQ2LTQ2ZTktYWU0Yy0xMGI1MmJmYTlmZjQifQ==
```

3. Generate a qr code from the string in step 2 and save the code as png on the host machine with filename `qr.png`.
4. Provide the `QR_PATH` in the .env file.

## Run demo

To start the backend run `docker compose up -d`.

If you not registered the device yet, then visit `https://<domain>:<port>` and follow the instructions shown on the page to register your device. 