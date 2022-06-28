import { OptionState } from "../../models/option";

export const flavorLabels =
[
    "European"
,   "American"
];

export const statusLabels =
[
    "Published"
,   "Withdrawn"
,   "Opened"
,   "Canceled"
,   "Exercised"
];

export const actionLabels =
[
    "published request"
,   "withdrawn request"
,   "opened option"
,   "canceled option"
,   "exercised option"
];

function createActions()
{
    let actions = {};
    let i = -1;

    for (let key of statusLabels) actions[key] = ++i as OptionState;

    return actions;
}

export const actions = createActions();