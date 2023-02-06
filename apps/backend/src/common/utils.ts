export enum IntBoolValue {
    TRUE = 1,
    FALSE = 0,
}

export function parseIntBoolValue(value: boolean | IntBoolValue | number): IntBoolValue {

    if (typeof value === 'boolean') {
        return value === true ? IntBoolValue.TRUE : IntBoolValue.FALSE;
    }

    if (typeof value === 'number') {
        return value === 0 ? IntBoolValue.FALSE : IntBoolValue.TRUE;
    }

    return value;
}

export const NOT_EXISTS_INT = -2147483648;
export const NOT_EXISTS_STRING = '-2147483648';
