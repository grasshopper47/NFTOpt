import { Address } from "@graphprotocol/graph-ts";

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

import {
    store,
} from "@graphprotocol/graph-ts";

export function fetchAccount(address: Address): Account
{
    let account = Account.load(address);

    if (account) return account;

    return new Account(address);
}

export function handlePublished(event: PublishEvent): void
{
    let request = new Request(event.params.param0.toString());
    request.save();

    let account = fetchAccount(event.transaction.from);
    account.requests = [request.id];
    account.options = [];
    account.save();
}

export function handleWithdrawn(event: WithdrawEvent): void
{
    let request = Request.load(event.params.param0.toString());
    if (request) store.remove("Request", request.id.toString());

    let account = fetchAccount(event.transaction.from);

    let index = account.requests.indexOf(event.params.param0.toString());
    if (index > -1)
    {
        account.requests.splice(index, 1);
        account.save();
    }
}

export function handleOpened(event: OpenEvent): void
{
    let option = new Option(event.params.param0.toString());
    option.save();

    let account = fetchAccount(event.transaction.from);
    account.options = [option.id];
    account.save();
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
