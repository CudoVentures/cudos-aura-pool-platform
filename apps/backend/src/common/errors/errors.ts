import { BadRequestException } from '@nestjs/common';

export enum ERROR_TYPES {
    WRONG_USER_OR_PASSWORD = '1',
    NOT_FOUND = '2',
    WRONG_OLD_PASSWORD = '3',
    WRONG_VERIFICATION_TOKEN = '4',
    WRONG_NONCE_SIGNATURE = '5',
    EMAIL_ALREADY_IN_USE = '6',

    COLLECTION_CREATION_ERROR = '7',
    COLLECTION_DENOM_EXISTS_ERROR = '8',
    COLLECTION_WRONG_DENOM_ERROR = '9',

    DATA_SERVICE_ERROR = '10',

    FARM_CREATION_ERROR = '11',

    WRONG_SERVICE_PARAMETERS = '12',
    GRAPHQL_COLLECTION_DENOM_NOT_FOUND_ERROR = '13',
    COLLECTION_DENOM_NOT_FOUND_ERROR = '14',
}

export class WrongUserOrPasswordException extends BadRequestException {
    constructor() {
        super(ERROR_TYPES.WRONG_USER_OR_PASSWORD)
    }
}

export class NotFoundException extends BadRequestException {
    constructor() {
        super(ERROR_TYPES.NOT_FOUND)
    }
}

export class WrongOldPasswordException extends BadRequestException {
    constructor() {
        super(ERROR_TYPES.WRONG_OLD_PASSWORD);
    }
}

export class WrongVerificationTokenException extends BadRequestException {
    constructor() {
        super(ERROR_TYPES.WRONG_VERIFICATION_TOKEN);
    }
}

export class WrongNonceSignatureException extends BadRequestException {
    constructor() {
        super(ERROR_TYPES.WRONG_NONCE_SIGNATURE);
    }
}

export class EmailAlreadyInUseException extends BadRequestException {
    constructor() {
        super(ERROR_TYPES.EMAIL_ALREADY_IN_USE);
    }
}

export class CollectionCreationError extends BadRequestException {
    constructor() {
        super(ERROR_TYPES.COLLECTION_CREATION_ERROR);
    }
}

export class CollectionDenomExistsError extends BadRequestException {
    constructor() {
        super(ERROR_TYPES.COLLECTION_DENOM_EXISTS_ERROR);
    }
}

export class CollectionDenomNotFoundError extends BadRequestException {
    constructor() {
        super(ERROR_TYPES.GRAPHQL_COLLECTION_DENOM_NOT_FOUND_ERROR);
    }
}

export class CollectionNotFoundError extends BadRequestException {
    constructor() {
        super(ERROR_TYPES.COLLECTION_DENOM_NOT_FOUND_ERROR);
    }
}

export class CollectionWrongDenomError extends BadRequestException {
    constructor() {
        super(ERROR_TYPES.COLLECTION_WRONG_DENOM_ERROR);
    }
}

export class DataServiceError extends BadRequestException {
    constructor() {
        super(ERROR_TYPES.DATA_SERVICE_ERROR);
    }
}

export class FarmCreationError extends BadRequestException {
    constructor() {
        super(ERROR_TYPES.FARM_CREATION_ERROR);
    }
}
