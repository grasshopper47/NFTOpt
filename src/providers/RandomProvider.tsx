import {useCallback, useState} from "react";
import {createContextProvider} from "./utils";

function useRandomNumberContext() {
    const [randomNumber, setRandomNumber] = useState(null);

    const setRandomData = useCallback((value: number) => {
        setRandomNumber(value);
    }, []);

    return {
        randomNumber,
        // Now you have a method you can use externally to set the data from the provider!
        setRandomNumber: setRandomData,
    };
}

export const [RandomNumberProvider, useRandomNumber] = createContextProvider(
    {
        name: "RandomNumberProvider",
    },
    useRandomNumberContext
);
