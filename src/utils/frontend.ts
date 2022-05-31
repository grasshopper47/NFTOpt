import toast from "react-hot-toast";
import { networkName, TOAST_DELAY, TOAST_DURATION } from "./constants";

export function getCorrectPlural(word: string, count: number)
{
    return word + (count > 1 ? "s" : "");
}

export function getAccountDisplayValue(account: string)
{
    return account?.slice(0, 6) + "..." + account?.slice(-4);
}

const waitingToastIds : string[] = [];

function getWaitingToastId()
{
    return waitingToastIds.shift();
}

function setWaitingToastId(id: string)
{
    if (id === "") { return; }

    waitingToastIds.push(id);
}

export function showToast(aPromise:Promise<any>)
{
    toast.promise
    (
        aPromise,
        {
            loading: "Waiting for user to confirm...",
            success:
            () =>
            {
                setTimeout
                (
                    () => setWaitingToastId(toast.loading(`Waiting for ${networkName} to confirm...`)),
                    TOAST_DURATION + TOAST_DELAY
                );

                return "Transaction sent";
            },

            error:
            (...err) =>
            {
                if (err[0]?.error?.code)
                {
                    return "Transaction error\n\n" + err[0]?.code;
                }

                if (err[0]?.code === 4001)   { return "User rejected transaction"; }
                if (err[0]?.code === -32603) { return "Invalid transaction!"; }

                console.log(err[0]);
                return err[0].message.toString();
            },
        },

        {
            loading: { duration: Infinity },
            success: { duration: TOAST_DURATION },
            error:   { duration: 0 }
        },
    );
}

export function dismissLastToast()
{
    const lastId = getWaitingToastId();

    if (!lastId) { return; }

    toast.dismiss(lastId);
    setWaitingToastId("");
}