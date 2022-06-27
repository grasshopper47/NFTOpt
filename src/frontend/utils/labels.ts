import { OptionState } from "../../models/option";

export const actionLabels =
[
    "published request"
,   "withdrawn request"
,   "opened option"
,   "canceled option"
,   "exercised option"
];

export const statusLabels =
[
    "Published"
,   "Withdrawn"
,   "Opened"
,   "Canceled"
,   "Exercised"
];

export const flavorLabels =
[
    "European"
,   "American"
];

function createEvents()
{
    let events = {};
    let i = -1;

    for (let key of statusLabels) events[key] = statusLabels[++i];

    return events;
}

export const events = createEvents();