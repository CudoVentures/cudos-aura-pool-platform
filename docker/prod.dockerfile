
FROM node:16-buster as builder

ARG WORKING_DIR="/usr/src/cudos-aura-platform"

COPY ./ ${WORKING_DIR}

WORKDIR ${WORKING_DIR}

RUN npm i

RUN npm run build:prod

FROM node:16-buster

ARG WORKING_DIR="/usr/local/cudos-aura-platform"  

WORKDIR ${WORKING_DIR}

COPY --from=builder "/usr/src/cudos-aura-platform/dist" ./

COPY --from=builder "/usr/src/cudos-aura-platform/apps/backend/database/" ./apps/backend/database

COPY --from=builder "/usr/src/cudos-aura-platform/package.json" ./

COPY --from=builder "/usr/src/cudos-aura-platform/config/.env" ./config/.env

RUN mkdir -p ${WORKING_DIR} && \
    chown -R node:node ${WORKING_DIR}

USER node

RUN npm i --omit=dev

CMD ["/bin/bash", "-c", "npm run migrate && node ./apps/backend/main.js"] 
