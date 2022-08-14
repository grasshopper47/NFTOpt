import { Address } from '@graphprotocol/graph-ts'
import { Transfer as TransferEvent } from './generated/ERC721Entity'

import {
    Account,
    ERC721Token
 } from './generated/schema'

function fetchAccount(address: Address): Account
{
    let account = Account.load(address);
    if (account) return account;

    account = new Account(address);
    account.save();

    return account;
}

export function handleTransfer(event: TransferEvent): void
{
    let account = fetchAccount(event.params.to).id;

    let address = event.address;
    let tokenID = event.params.tokenId;
    let id      = address.toHex().concat('/').concat(tokenID.toHex());

    let token = ERC721Token.load(id);
    if (!token) token = new ERC721Token(id);

    token.identifier = tokenID;
    token.contract   = address;
    token.owner      = account;

    token.save();
}
