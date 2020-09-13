# `plugin-push`

Uploads application bundle to a cloud storage bucket.

## How to Install

```
$ yarn plugin import https://yarnplugins.com/push
```

## How to Use

```bash
$ yarn push --bucket=pkg.example.com --version=123 dist/package.zip
# => uploads package.zip to gs://pkg.example.com/package_123.zip
```

```bash
$ yarn push --bucket=pkg.example.com --version=123 dist/package.zip:app_{version}.zip
# => uploads package.zip to gs://pkg.example.com/app_123.zip
```

```bash
$ yarn push --bucket=pkg.example.com --version=123 one.js two.js
# => uploads one.js to gs://pkg.example.com/one_123.js
#    uploads two.js to gs://pkg.example.com/two_123.js
```

From there on, you can deploy and redeploy the uploaded package to a serverless
environment. For example:

```bash
$ gcloud functions deploy api --source=gs://pkg.example.com/app_123.zip ...
```

You can also pass bucket name and/or version number as an environment variable:

```bash
$ PKG_BUCKET=pkg.example.com VERSION=123 yarn push dist/app.zip
```

or, load it from the `.env` file

```bash
$ yarn push -r dotenv/config dist/app.zip
```
