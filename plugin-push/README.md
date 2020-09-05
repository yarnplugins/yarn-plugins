# `plugin-push`

Uploads application bundle (file) to a cloud storage bucket.

## How to Install

```
$ yarn plugin import push
```

## How to Use

```bash
$ yarn push --bucket=pkg.example.com --version=123 package.zip
# => uploads package.zip to gs://pkg.example.com/${pkgName}_123.zip
```

```bash
$ yarn push --bucket=pkg.example.com --version=123 one.js two.js
# => uploads one.js to gs://pkg.example.com/{pkgName}_one_123.js
#    uploads two.js to gs://pkg.example.com/{pkgName}_two_123.js
```

From there on, you can deploy or redeploy the uploaded package to a serverless
environment. For example:

```bash
$ gcloud functions deploy api --source=gs://pkg.example.com/api_123.zip
```

If no `--bucket` argument was provided, it will attempt to use `PKG_BUCKET`
environment variable.
