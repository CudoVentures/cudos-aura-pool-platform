FROM node:16-buster

ARG USER_ID
ARG USER_NAME
ARG GROUP_ID
ARG GROUP_NAME
ARG AURA_POOL_BACKEND
ARG WORKING_DIR="/usr/cudos-aura-chain-observer"

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

ENV App_Host=${AURA_POOL_BACKEND}

CMD ["/bin/bash", "-c", "npm i && (trap 'kill 0' SIGINT; npm run start:chain-observer:dev)"] 
