
FROM node:16-buster as builder

ARG WORKING_DIR="/usr/src/cudos-markets-platform"

COPY ./ ${WORKING_DIR}

WORKDIR ${WORKING_DIR}

RUN npm i

RUN npm run build:platform:prod

FROM node:16-buster

ARG WORKING_DIR="/usr/local/cudos-markets-platform"  

WORKDIR ${WORKING_DIR}

COPY --from=builder "/usr/src/cudos-markets-platform/dist" ./

COPY --from=builder "/usr/src/cudos-markets-platform/apps/backend/database/" ./apps/backend/database

COPY --from=builder "/usr/src/cudos-markets-platform/package.json" ./

COPY --from=builder "/usr/src/cudos-markets-platform/config/.env" ./config/.env

COPY --from=builder "/usr/src/cudos-markets-platform/config/gcloud.json" ./config/gcloud.json

RUN mkdir -p ${WORKING_DIR} && \
    chown -R node:node ${WORKING_DIR}

USER node

RUN npm i --omit=dev

CMD ["/bin/bash", "-c", "npm run start:built:platform"] 
