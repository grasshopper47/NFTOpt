import React, {useEffect, useState} from "react";
import Layout from "../components/Layout";
import OptionsListContainer from "../components/OptionsListContainer";
import {address0, dummyOptions} from "../utils/dummyData";
import {Option} from "../utils/declarations";
import {useAccount} from "../providers/contexts";

function MyOptions() {
    // TODO: retrieve correct options
    // const account = useAccount();
    const account = address0;

    const [currentAccountOptions, setCurrentAccountOptions] = useState<Option[]>([]);

    useEffect(() => {
        setCurrentAccountOptions(
            dummyOptions.filter((option) => option.buyer === account || option.seller === account)
        );
    }, [dummyOptions, account]);

    return (
        <Layout>
            <OptionsListContainer key={`my-options-list`} title={"Your NFT Options"} options={currentAccountOptions} />
        </Layout>
    );
}

export default MyOptions;
