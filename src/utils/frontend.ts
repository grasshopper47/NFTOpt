export function getCorrectPlural(word: string, count: number) {
    return word + (count > 1 ? "s" : "");
}

export function getAccountDisplayValue(account: string) {
    return account?.slice(0, 6) + "..." + account?.slice(-4);
}