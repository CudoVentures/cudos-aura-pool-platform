FROM node:16-buster as builder

ARG WORKING_DIR="/usr/src/cudos-aura-eth-payments-relayer"

COPY ./ ${WORKING_DIR}

WORKDIR ${WORKING_DIR}

RUN npm i

RUN npm run build:eth-payment-relayer:prod

FROM node:16-buster

ARG WORKING_DIR="/usr/local/cudos-aura-eth-payments-relayer"  

WORKDIR ${WORKING_DIR}

COPY --from=builder "/usr/src/cudos-aura-eth-payments-relayer/dist" ./

COPY --from=builder "/usr/src/cudos-aura-eth-payments-relayer/package.json" ./

COPY --from=builder "/usr/src/cudos-aura-eth-payments-relayer/config/.env" ./config/.env

RUN mkdir -p ${WORKING_DIR} && \
    chown -R node:node ${WORKING_DIR}

USER node

ENV App_Host="http://cudos-aura-platform-prod"

RUN npm i --omit=dev

CMD ["/bin/bash", "-c", "npm run start:built:eth-payment-relayer"] 
