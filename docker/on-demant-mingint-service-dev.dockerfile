FROM node:16-buster

ARG USER_ID
ARG USER_NAME
ARG GROUP_ID
ARG GROUP_NAME
ARG WORKING_DIR="/usr/cudos-on-demand-minting-service"

RUN if [ $USER_NAME != 'root' ]; then \
        groupmod -g 2000 node; \
        usermod -u 2000 -g 2000 node; \
        groupadd --gid ${GROUP_ID} ${GROUP_NAME}; \
        useradd --no-log-init --create-home --shell /bin/bash --uid ${USER_ID} --gid ${GROUP_ID} ${USER_NAME}; \
    fi

WORKDIR ${WORKING_DIR}

USER ${USER_NAME}

# CMD ["/bin/bash", "-c", "npm i && (trap 'kill 0' SIGINT; npm run start:chain-observer:dev)"] 
CMD ["sleep", "infinity"]