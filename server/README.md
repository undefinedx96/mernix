# Mernix Server

## Built with Node + Express + TypeScript

- [Model link](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)


### CLI to convert Postman collections to OpenAPI:

```bash
p2o ./mernix.postman_collection.json -f ./swaggerDoc.yaml
```


### CLI to run `ngrok` server with local server

```bash
ngrok http PORT --url=http://dummy-url.ngrok-free.dev --traffic-policy-file=traffic-policies.yaml
```