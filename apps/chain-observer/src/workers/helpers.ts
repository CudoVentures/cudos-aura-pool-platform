export function convertBlockTimeToTimestamp(blockTime: string): number {
    // '2020-02-15T10:39:10.4696305Z'

    const dateComponents = blockTime.split('T');
    const timeComponents = dateComponents[1].split(':');
    const [year, month, day] = dateComponents[0].split('-');
    const [hours, minutes] = timeComponents;
    const seconds = timeComponents[2].split('.')[0];

    const date = new Date(+parseInt(year), parseInt(month) - 1, +parseInt(day), +parseInt(hours), +parseInt(minutes), +parseInt(seconds));

    return date.getTime();
}
