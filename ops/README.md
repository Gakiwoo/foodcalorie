# Operations

Production configuration kept here is intentionally free of credentials. Secrets belong in the
server environment or CI secret store and must never be committed.

## Node.js runtime

Production uses Node.js 24 Active LTS from `/opt/node-v24/bin`. Install backend dependencies with
`/opt/node-v24/bin/npm ci --omit=dev`, then start the API through
`pm2 start /var/www/foodcalorie-api/ecosystem.config.cjs --only foodcalorie-api --update-env`.
The committed PM2 configuration pins the interpreter so a global PM2 daemon cannot silently fall
back to an end-of-life system Node.js release.

## SSH baseline

`sshd/99-foodcalorie-hardening.conf` disables password authentication while retaining public-key
access. Deploy it as `/etc/ssh/sshd_config.d/99-foodcalorie-hardening.conf`, run `sshd -t`, reload
SSH, and verify a second public-key session before locking an existing account password.

## Release signing

Android release signing is configured with local Gradle properties or environment variables:

- `FC_RELEASE_STORE_FILE`
- `FC_RELEASE_STORE_PASSWORD`
- `FC_RELEASE_KEY_ALIAS`
- `FC_RELEASE_KEY_PASSWORD`

Never place these values in a tracked file.

## Private uploads

Include `nginx/private-uploads.conf` in the FoodCalorie virtual host. The application serves images
through `/api/v1/foodcalorie/ai/images/:filename` after authenticating the owner. The underlying
upload directory must not be exposed with an nginx `alias`.
