import { OptionState } from "../../models/option";

export const flavorLabels =
[
    "European"
,   "American"
];

export const stateLabels =
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

    for (let key of stateLabels) actions[key] = { state: ++i as OptionState, label: actionLabels[i] }

    return actions;
}

export const actions = createActions();