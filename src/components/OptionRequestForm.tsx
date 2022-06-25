// @ts-ignore
import classes from "../styles/components/OptionRequestForm.module.scss";

import { Button, FormControl, RadioGroup } from "@mui/material";
import clsx from "clsx";
import { useRef, useState } from "react";
import { BIGNUMBER0, SECONDS_IN_A_DAY } from "../utils/constants";
import { NFTAsset, OptionFlavor, OptionRequest } from "../utils/types";
import { ethers } from "ethers";
import { loadNFTImage, imageOf, keyOf } from "../utils/NFT/localhost";
import { getFloatString, getIntervalString, showToast } from "../utils/frontend";
import { contracts } from "../utils/blockchain";
import TextBox_OptionRequestForm from "../fragments/TextBox.OptionRequest";
import Radio_OptionRequestForm from "../fragments/Radio.OptionRequest";
import DropDown_OptionRequestForm from "../fragments/DropDown.OptionRequest";
import { useupdateOptionsHash } from "../pages/_app";

const defaultRequest =
{
    nftContract : ""
,   nftId       : BIGNUMBER0
,   interval    : "1"
,   premium     : "1"
,   strikePrice : "1"
,   flavor      : OptionFlavor.AMERICAN
}

function OptionRequestForm()
{
    const request = useRef<OptionRequest>(defaultRequest);

    const [ image, setImage ] = useState("");

    let updateOptionsHash = useupdateOptionsHash();

    const setAsset = (asset? : NFTAsset | null) =>
    {
        // triggered by dropdown to refresh the image
        if (asset === undefined)
        {
            setImage(imageOf(request.current));

            return;
        }

        if (asset === null)
        {
            request.current.nftId       = BIGNUMBER0;
            request.current.nftContract = "";

            setImage("");

            return;
        }

        console.log("setAsset");

        request.current.nftId       = asset.nftId;
        request.current.nftContract = asset.nftContract;

        let image = imageOf(request.current);

        if (image) setImage(image);
        else       loadNFTImage(request.current.nftContract, request.current.nftId).then(setImage);
    };

    const setAmount = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        // setRequestState( prev => ({ ...prev, [event.target.id] : getFloatString(event.target.value) }) );

        request.current[event.target.id] = getFloatString(event.target.value); updateOptionsHash();
    };

    const setInterval = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        // setRequestState( prev => ({ ...prev, interval : getIntervalString(event.target.value) }) );

        request.current.interval = getIntervalString(event.target.value); updateOptionsHash();
    };

    const setFlavor = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        request.current.flavor = parseInt(event.target.value) as OptionFlavor;
    };

    const onPublishRequest = () =>
    {
        showToast
        (
            contracts.NFTOpt.publishOptionRequest
            (
                request.current.nftContract
            ,   request.current.nftId
            ,   ethers.utils.parseEther(request.current.strikePrice)
            ,   parseInt(request.current.interval) * SECONDS_IN_A_DAY
            ,   request.current.flavor
            ,   { value: ethers.utils.parseEther(request.current.premium) }
            )
            // .then(() => setRequestState({...defaultRequest}))
            .then(() => request.current = {...defaultRequest})
            .then(updateOptionsHash)
        );
    };

    return <>
        <p className="page-title">Request a PUT Option</p>

        <div className={classes.root}>
            <div className={classes.form}>

                <DropDown_OptionRequestForm value={keyOf(request.current)} setAsset={setAsset}/>

                <TextBox_OptionRequestForm fieldName="premium"     value={request.current.premium}     onChange={setAmount}   />
                <TextBox_OptionRequestForm fieldName="strikePrice" value={request.current.strikePrice} onChange={setAmount}   />
                <TextBox_OptionRequestForm fieldName="interval"    value={request.current.interval}    onChange={setInterval} />

                <FormControl className={classes.field}>
                    <RadioGroup defaultValue={OptionFlavor.AMERICAN}>
                        <Radio_OptionRequestForm flavor={OptionFlavor.AMERICAN} onChange={setFlavor} />
                        <Radio_OptionRequestForm flavor={OptionFlavor.EUROPEAN} onChange={setFlavor} />
                    </RadioGroup>
                </FormControl>

                <Button
                    className={classes.submitBtn}
                    variant="contained"
                    onClick={onPublishRequest}
                    disabled=
                    {
                        request.current.nftContract    === ""
                        || request.current.premium     === ""
                        || request.current.strikePrice === ""
                        || request.current.interval    === ""
                    }
                >
                    Publish Request
                </Button>

            </div>

            <div className={clsx(classes.imageContainer, !request.current.nftContract && classes.dummyImageContainer)}>
            {
                request.current.nftContract
                ?   <img src={image} alt="NFT image data" />
                :   Array.from({ length: 3 }).map((_, i) => <div key={`dot-${i}`} className={classes.dot} />)
            }
            </div>
        </div>
    </>;
}

export default OptionRequestForm;