FROM node:16-buster

ARG USER_ID
ARG USER_NAME
ARG GROUP_ID
ARG GROUP_NAME
ARG CUDOS_MARKETS_BACKEND
ARG CHAIN_RPC
ARG WORKING_DIR="/usr/cudos-markets-eth-payments-relayer"
ARG ETH_NODE_URL
ARG ETH_CHAIN_ID
ARG CUDOS_MARKETS_CONTRACT_ADDRESS
ARG CONTRACT_ADMIN_PRIVATE_KEY

RUN if [ $USER_NAME != 'root' ]; then \
        groupmod -g 2000 node; \
        usermod -u 2000 -g 2000 node; \
        groupadd --gid ${GROUP_ID} ${GROUP_NAME}; \
        useradd --no-log-init --create-home --shell /bin/bash --uid ${USER_ID} --gid ${GROUP_ID} ${USER_NAME}; \
    fi

COPY ./package.json "${WORKING_DIR}/package.json"

RUN mkdir -p "${WORKING_DIR}/node_modules" && \
    chown -R ${USER_NAME}:${GROUP_NAME} "${WORKING_DIR}"


WORKDIR ${WORKING_DIR}

USER ${USER_NAME}

ENV App_Host=${CUDOS_MARKETS_BACKEND}
ENV APP_CUDOS_RPC=${CHAIN_RPC}

CMD ["/bin/bash", "-c", "npm i && (trap 'kill 0' SIGINT; npm run start:eth-payments-relayer:dev)"] 
