import toast from "react-hot-toast";
import {TOAST_DURATION} from "./constants";

export function getCorrectPlural(word: string, count: number) {
    return word + (count > 1 ? "s" : "");
}

export function getAccountDisplayValue(account: string) {
    return account?.slice(0, 6) + "..." + account?.slice(-4);
}

export function throwTransactionToast(action: "sent" | "failed") {
    toast[action === "sent" ? "success" : "error"](`Transaction ${action}`, {duration: TOAST_DURATION});
}
