# syntax=docker/dockerfile:1
FROM node:current-alpine AS development

WORKDIR /usr/src/app

COPY package.json /usr/src/app/package.json
COPY yarn.lock /usr/src/app/yarn.lock
COPY .npmrc /usr/src/app/.npmrc

RUN yarn

COPY . /usr/src/app/

EXPOSE 3000

CMD ["yarn", "start"]

FROM development as dev-envs
RUN <<EOF
apt-get update
apt-get install -y --no-install-recommends git
EOF

RUN <<EOF
useradd -s /bin/bash -m vscode
groupadd docker
usermod -aG docker vscode
EOF
# install Docker tools (cli, buildx, compose)
COPY --from=gloursdocker/docker / /
CMD ["yarn", "start"]