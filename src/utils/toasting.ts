import toast from "react-hot-toast";
import { network } from "./frontend/metamask";

const TOAST_DELAY = 333;

let showLoadingToast = false;

const activeToasts : string[] = [];

export const TOAST_DURATION = 2000;

export function showToast(aPromise:Promise<any>)
{
    toast.promise
    (
        aPromise,
        {
            loading: "Waiting for user to confirm..."
        ,   success:
            () =>
            {
                setTimeout
                (
                    () =>
                    {
                        if (!showLoadingToast) return;

                        setWaitingToastId(toast.loading(`Waiting for ${network()} to confirm...`));
                    }
                ,   TOAST_DURATION + TOAST_DELAY
                );

                showLoadingToast = true;

                return "Transaction sent";
            }

        ,   error:
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
            }
        }

    ,   {
            loading: { duration: Infinity }
        ,   success: { duration: TOAST_DURATION }
        ,   error:   { duration: 0 }
        }
    );
}

export function dismissLastToast()
{
    const lastId = getWaitingToastId();

    if (!lastId) { showLoadingToast = false; return; }

    toast.dismiss(lastId);
}

function getWaitingToastId()
{
    return activeToasts.shift();
}

function setWaitingToastId(id: string)
{
    if (!id) return;

    activeToasts.push(id);
}