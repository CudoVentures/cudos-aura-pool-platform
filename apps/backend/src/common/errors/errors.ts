import { BadRequestException } from '@nestjs/common';

enum ERROR_TYPES {
    WRONG_PASSWORD = '1',
    NOT_FOUND = '2',
}

export class WrongPasswordException extends BadRequestException {
    constructor() {
        super(ERROR_TYPES.WRONG_PASSWORD)
    }
}

export class NotFoundException extends BadRequestException {
    constructor() {
        super(ERROR_TYPES.NOT_FOUND)
    }
}
