FROM node:16-buster as builder

ARG WORKING_DIR="/usr/src/cudos-markets-eth-payments-relayer"

COPY ./ ${WORKING_DIR}

WORKDIR ${WORKING_DIR}

RUN npm i

RUN npm run build:eth-payments-relayer:prod

FROM node:16-buster

ARG WORKING_DIR="/usr/local/cudos-markets-eth-payments-relayer"  

WORKDIR ${WORKING_DIR}

COPY --from=builder "/usr/src/cudos-markets-eth-payments-relayer/dist" ./

COPY --from=builder "/usr/src/cudos-markets-eth-payments-relayer/package.json" ./

COPY --from=builder "/usr/src/cudos-markets-eth-payments-relayer/config/.env" ./config/.env

RUN mkdir -p ${WORKING_DIR} && \
    chown -R node:node ${WORKING_DIR}

USER node

ENV App_Host="http://cudos-markets-platform-prod"

RUN npm i --omit=dev

CMD ["/bin/bash", "-c", "npm run start:built:eth-payments-relayer"] 
