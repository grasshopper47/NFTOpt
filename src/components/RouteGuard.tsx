import {useRouter} from "next/router";
import {useEffect} from "react";
import {WithChildren} from "../utils/declarations";

type RouteGuardProps = {
    account: string;
    loaded: boolean;
} & WithChildren;

function RouteGuard(props: RouteGuardProps): JSX.Element {
    const router = useRouter();
    const {account, loaded} = props;

    useEffect(() => {
        if (!account && router.route !== "/" && loaded) {
            router.push("/");
        }
    }, [account, router.route, loaded]);

    if (!loaded || (loaded && account == null && router.route !== "/")) {
        return null;
    }

    return props.children as JSX.Element;
}

export default RouteGuard;
