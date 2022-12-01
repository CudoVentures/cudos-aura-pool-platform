import { BadRequestException } from '@nestjs/common';

enum ERROR_TYPES {
    WRONG_USER_OR_PASSWORD = '1',
    NOT_FOUND = '2',
    WRONG_OLD_PASSWORD = '3',
    WRONG_VERIFICATION_TOKEN = '4',
    WRONG_NONCE_SIGNATURE = '5',
    EMAIL_ALREADY_IN_USE = '6',
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
