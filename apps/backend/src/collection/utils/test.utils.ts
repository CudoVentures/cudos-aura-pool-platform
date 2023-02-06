export function getZeroDatePlusDaysTimestamp(numberOfDaysToAdd: number): number {
    const zeroDate = new Date(0);
    const result = zeroDate.setDate(zeroDate.getDate() + numberOfDaysToAdd);

    return result;
}
