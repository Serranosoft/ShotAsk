import { isLoaded } from "expo-font";
import React, { forwardRef, useEffect, useImperativeHandle } from "react"
import { TestIds, useInterstitialAd } from "react-native-google-mobile-ads";
import { intersitialId } from "../../src/utils/constants"

const AdsHandler = forwardRef((props, ref) => {

    
    const {
        isLoaded: isLoadedIntersitial,
        isClosed: isClosedIntersitial,
        load: loadIntersitial,
        show: showIntersitial } = useInterstitialAd(intersitialId/* TestIds.INTERSTITIAL */, {
            requestNonPersonalizedAdsOnly: true,
        });

    useEffect(() => {
        loadIntersitial();
    }, [loadIntersitial])

    useImperativeHandle(ref, () => ({
        loadIntersitialAd() {
            loadIntersitial();
        },
        showIntersitialAd() {
            showIntersitialAd();
        },
        isClosedIntersitial() {
            return isClosedIntersitial;
        },
        isLoadedIntersitial() {
            return isLoadedIntersitial;
        },
    }))

    useEffect(() => {
        if (isClosedIntersitial) {
            if (props.closedIntersitialCallback) {
                props.closedIntersitialCallback();
            }
        } else {
            loadIntersitial();
        }

    }, [isClosedIntersitial, props.closedIntersitialCallback])


    function showIntersitialAd() {
        if (isLoadedIntersitial) {
            showIntersitial();
        } else {
            loadIntersitial();
        }
    }

    return <></>
})

export default AdsHandler