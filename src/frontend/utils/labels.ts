import { OptionState } from "../../models/option";

export const actionLabels =
[
    "published request"
,   "withdrawn request"
,   "opened option"
,   "canceled option"
,   "exercised option"
];

export const flavorLabels =
[
    "European"
,   "American"
];

export const events =
{
    Published : OptionState.PUBLISHED
,   Withdrawn : OptionState.WITHDRAWN
,   Opened    : OptionState.OPEN
,   Canceled  : OptionState.CANCELED
,   Exercised : OptionState.EXERCISED
};