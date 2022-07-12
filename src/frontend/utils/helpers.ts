export function getIntervalString(value : string)
{
    if (value) return Math.max(1, Math.min(parseInt(value), 30)).toString();

    return "";
}

export function getFloatString(value : string)
{
    if ((/^([0-9]*[.])?[0-9]*$/).test(value) && parseFloat(value) >= 0) return value;

    return "";
}

export function getAccountDisplayValue(account: string)
{
    if (account) return account.slice(0, 6) + "..." + account.slice(-4);

    return undefined;
}
