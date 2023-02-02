FROM amd64/golang:1.18-buster

RUN apt-get update && apt-get install git

ARG USER_ID
ARG USER_NAME
ARG GROUP_ID
ARG GROUP_NAME
ARG WORKING_DIR="/usr/cudos-on-demand-minting-service"

ARG MINTER_WALLET_MNEMONIC
ARG AURA_POOL_BACKEND
ARG MINTER_STATE_FILE
ARG MINTER_MAX_RETRIES
ARG MINTER_RETRY_INTERVAL
ARG MINTER_RELAY_INTERVAL
ARG MINTER_PAYMENT_DENOM
ARG MINTER_PORT
ARG CHAIN_ID
ARG CHAIN_RPC
ARG CHAIN_GRPC

ENV WALLET_MNEMONIC=${MINTER_WALLET_MNEMONIC}
ENV AURA_POOL_BACKEND=${AURA_POOL_BACKEND}
ENV STATE_FILE=${MINTER_STATE_FILE}
ENV MAX_RETRIES=${MINTER_MAX_RETRIES}
ENV RETRY_INTERVAL=${MINTER_RETRY_INTERVAL}
ENV RELAY_INTERVAL=${MINTER_RELAY_INTERVAL}
ENV PAYMENT_DENOM=${MINTER_PAYMENT_DENOM}
ENV PORT=${MINTER_PORT}
ENV CHAIN_ID=${CHAIN_ID}
ENV CHAIN_RPC=${CHAIN_RPC}
ENV CHAIN_GRPC=${CHAIN_GRPC}

WORKDIR ${WORKING_DIR}

COPY ./CudosOnDemandMintingService ./CudosOnDemandMintingService

WORKDIR ${WORKING_DIR}/CudosOnDemandMintingService

RUN go build -mod=readonly ./cmd/cudos-ondemand-minting-service

RUN echo "WALLET_MNEMONIC=\"${MINTER_WALLET_MNEMONIC}\"" > .env && \
    echo "CHAIN_ID=${CHAIN_ID}" >> .env && \
    echo "CHAIN_RPC=${CHAIN_RPC}" >> .env && \
    echo "CHAIN_GRPC=${CHAIN_GRPC}" >> .env && \
    echo "AURA_POOL_BACKEND=${AURA_POOL_BACKEND}" >> .env && \
    echo "STATE_FILE=${MINTER_STATE_FILE}" >> .env && \
    echo "MAX_RETRIES=${MINTER_MAX_RETRIES}" >> .env && \
    echo "RETRY_INTERVAL=${MINTER_RETRY_INTERVAL}" >> .env && \
    echo "RELAY_INTERVAL=${MINTER_RELAY_INTERVAL}" >> .env && \
    echo "PAYMENT_DENOM=${MINTER_PAYMENT_DENOM}" >> .env && \
    echo "PORT=${MINTER_PORT} " >> .env && \
    echo "PRETTY_LOGGING=1" >> .env && \
    echo "SENDGRID_API_KEY='' " >> .env && \
    echo "EMAIL_FROM='' " >> .env && \
    echo "SERVICE_EMAIL='' " >> .env

# CMD ["sleep", "infinity"]
CMD ["/bin/bash", "-c", "./cudos-ondemand-minting-service"]
