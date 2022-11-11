
FROM node:16-buster

ARG USER_ID
ARG USER_NAME
ARG GROUP_ID
ARG GROUP_NAME
ARG WORKING_DIR="/usr/cudos-aura-platform"

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

CMD ["/bin/bash", "-c", "npm i && npx sequelize db:migrate --config=./apps/backend/database/config/config.js --migrations-path=./apps/backend/database/migrations && (trap 'kill 0' SIGINT; npm run start:backend:dev & npm run build:frontend:dev)"] 
