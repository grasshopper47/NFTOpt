import { Option } from "./option";

export type Request_DISPLAY =
Omit<Option,
    "buyer"
|   "interval"
|   "premium"
|   "strikePrice"
|   "nftId"
|   "nftContract"
> &
{
    interval    : string
,   premium     : string
,   strikePrice : string
};
