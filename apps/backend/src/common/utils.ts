import BigNumber from 'bignumber.js';

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
export const FIFTEEN_MINUTES_IN_MILIS = 15 * 60 * 1000;
export const BIG_NUMBER_0 = new BigNumber(0);
