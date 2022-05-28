import React, {useState, useEffect} from "react";
import {AppProps} from "next/app";
import "./_app.scss";
import {AccountContext, ContractsContext} from "../providers/contexts";
import {networkName, TOAST_DURATION} from "../utils/constants";
import {
    getCurrentAccount,
    getEthereumObject,
    getSignedContract,
    setupEthereumEventListeners,
    connectWallet,
} from "../utils/frontend";
import NFTOptSolContract from "../../artifacts/contracts/NFTOpt.sol/NFTOpt.json";
import addresses from "../../addresses.json";
import Header from "../components/Header";
import toast, {Toaster} from "react-hot-toast";
import RouteGuard from "../components/RouteGuard";
import {NFTOpt} from "../../typechain-types";
import {ethers} from "ethers";

export default function App({Component, pageProps}: AppProps) {
    const [account, setAccount] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [contracts, setContracts] = useState<{nftOpt: NFTOpt}>({
        nftOpt: null,
    });

    let blockNo = 0;
    let provider: any = {};

    const success = async (message: string) => {
        let newBlockNo = await provider.getBlockNumber();

        if (blockNo < newBlockNo) {
            blockNo = newBlockNo;
            toast.success("Successfully " + message, {duration: TOAST_DURATION});
        }
    };

    const attachEventListeners = (contract: NFTOpt) => {
        contract.on("NewRequest", () => {
            success("published a new request");
        });
        contract.on("Exercised", (from, amount, tx) => {
            success("exercised the option request");
        });
        contract.on("Filled", (from, amount, tx) => {
            success("filled the option request");
        });
        contract.on("Canceled", (from, amount, tx) => {
            success("canceled the option request");
        });
        contract.on("Withdrawn", (from, amount, tx) => {
            success("withdrawn the option request");
        });
    };

    const removeEventListeners = (contract: NFTOpt) => {
        contract.removeAllListeners("NewRequest");
        contract.removeAllListeners("Exercised");
        contract.removeAllListeners("Filled");
        contract.removeAllListeners("Canceled");
        contract.removeAllListeners("Withdrawn");
    };

    const load = async () => {
        const ethereum = getEthereumObject();
        if (!ethereum) {
            return;
        }

        setupEthereumEventListeners(ethereum);

        provider = new ethers.providers.Web3Provider(getEthereumObject(), "any");
        blockNo = await provider.getBlockNumber();

        const NFTOptContract = getSignedContract(addresses[networkName].NFTOpt, NFTOptSolContract.abi);

        if (!NFTOptContract) {
            return null;
        }

        const currentAccount = await getCurrentAccount();
        const contract = NFTOptContract as NFTOpt;

        attachEventListeners(contract);

        setContracts({nftOpt: contract});
        setAccount(currentAccount);

        setLoaded(true);
    };

    useEffect(() => {
        load();

        return () => {
            setLoaded(false);
        };
    }, []);

    useEffect(() => {
        if (!contracts.nftOpt) {
            return;
        }
        return () => {
            removeEventListeners(contracts.nftOpt);
        };
    }, [contracts.nftOpt]);

    return (
        <AccountContext.Provider value={account}>
            <ContractsContext.Provider value={contracts}>
                <RouteGuard account={account} loaded={loaded}>
                    <Toaster />
                    <Header account={account} onConnectAccount={connectWallet.bind(null, setAccount)} />
                    <Component {...pageProps} />
                </RouteGuard>
            </ContractsContext.Provider>
        </AccountContext.Provider>
    );
}
