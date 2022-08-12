import { events, transactions } from '@amxx/graphprotocol-utils'
import { Address } from '@graphprotocol/graph-ts'
import { ERC721Transfer } from './generated/schema'
import { Transfer as TransferEvent } from './generated/ERC721Entity'
import { fetchAccount } from '../../datasources/graph/account'
import { fetchERC721, fetchERC721Token } from '../../datasources/graph/ERC721'

export function handleTransfer(event: TransferEvent): void
{
    let contract = fetchERC721(event.address);

    if (contract == null) return;

    let token = fetchERC721Token(contract, event.params.tokenId);
    let from  = fetchAccount(event.params.from);
    let to    = fetchAccount(event.params.to);

    token.owner    = to.id;
    token.approval = fetchAccount(Address.zero()).id; // implicit approval reset on transfer

    contract.save();
    token.save();

    let ev         = new ERC721Transfer(events.id(event));
    ev.emitter     = contract.id;
    ev.transaction = transactions.log(event).id;
    ev.timestamp   = event.block.timestamp;
    ev.contract    = contract.id;
    ev.token       = token.id;
    ev.from        = from.id;
    ev.to          = to.id;
    ev.save();
}
