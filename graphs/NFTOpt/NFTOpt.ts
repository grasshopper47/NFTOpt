import { Address, Bytes } from "@graphprotocol/graph-ts";
import { store } from "@graphprotocol/graph-ts";

import {
    Published as PublishEvent,
    Withdrawn as WithdrawEvent,
    Opened as OpenEvent,
    Exercised as ExerciseEvent,
    Canceled as CancelEvent
} from "../NFTOpt/generated/NFTOptEntity";

import {
    Account,
    Request,
    Option
} from "../NFTOpt/generated/schema";

function fetchAccount(address: Address): Account
{
    let account = Account.load(address);
    if (account) return account;

    account = new Account(address);
    account.save();

    return account;
}

function removeRequest(id: string): Request | null
{
    let request = Request.load(id);
    if (request) store.remove("Request", id);

    return request;
}

export function handlePublished(event: PublishEvent): void
{
    let id = event.params.param0.toString();

    let request = Request.load(id);
    if (!request) request = new Request(id);

    request.buyer = fetchAccount(event.transaction.from).id;
    request.save();
}

export function handleWithdrawn(event: WithdrawEvent): void
{
    removeRequest(event.params.param0.toString());
}

export function handleOpened(event: OpenEvent): void
{
    let id = event.params.param0.toString();

    let request = removeRequest(id);

    let option = Option.load(id);
    if (!option) option = new Option(id);
    option.buyer  = request ? request.buyer : new Bytes(0);
    option.seller = fetchAccount(event.transaction.from).id;
    option.save();
}

export function handleCanceled(event: CancelEvent): void
{
    let option = Option.load(event.params.param0.toString());
    if (!option) return;

    option.isExercised = false;
    option.save();
}

export function handleExercised(event: ExerciseEvent): void
{
    let option = Option.load(event.params.param0.toString());
    if (!option) return;

    option.isExercised = true;
    option.save();
}
