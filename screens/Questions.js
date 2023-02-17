import { Image, ImageBackground, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../src/supabaseClient";
import "../src/fonts";
import { BannerAd, BannerAdSize, TestIds, useInterstitialAd } from 'react-native-google-mobile-ads';
import InAppReview from 'react-native-in-app-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

const adUnitId = "ca-app-pub-3963345159052388/8141135317";

InAppReview.isAvailable();

export default function Questions({ route }) {

    const { mode, users } = route.params;

    let questionsArr = useRef([]); // Array de preguntas que ya han visto.
    let questionsCount = useRef(0); // Cantidad de preguntas que hay en la base de datos.
    let usersIndex = useRef(0); // Índice para saber que usuario es el que le toca responder.

    const [triggerAd, setTriggerAd] = useState(0);
    const [question, setQuestion] = useState("");
    const [user, setUser] = useState("");
    
    const { isLoaded, isClosed, load, show } = useInterstitialAd("ca-app-pub-3963345159052388/3312260713"/* TestIds.INTERSTITIAL */, {
        requestNonPersonalizedAdsOnly: true,
    });

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        load();
    }, [isClosed])

    // Calcular cantidad de preguntas que hay en base de datos.
    useEffect(() => {
        if (questionsCount == 0) {
            const fetchCount = async () => {
                const { data, count } = await supabase
                    .from(mode)
                    .select('*', { count: 'exact' })

                questionsCount = count;
            }
            fetchCount();
        }
    })

    // Al comenzar el juego, se obtiene una pregunta
    useEffect(() => {
        fetchQuestion();
        load();
    }, [])

    useEffect(() => {
        if (triggerAd === 10) {
            // Trigger intersitial
            if (isLoaded) {
                show();
            }
            setTriggerAd(0)
        }
    }, [triggerAd])

    // Mostrar el usuario actual.
    function fetchUser() {

        let nextUser = users[usersIndex.current];
        usersIndex.current++;

        if (usersIndex.current == users.length) {
            usersIndex.current = 0;
        }

        setUser(nextUser);
    }

    // Mostrar la pregunta
    const fetchQuestion = async () => {
        const { data, error } = await supabase
            .from(`random_${mode}`)
            .select("Question")
            .limit(1)
            .single();
        if (data) {
            setQuestion(data.Question);
            fetchUser();
            
            // Si el usuario ha visto todas las preguntas entonces se reinicia
            if (questionsArr.current.length === questionsCount) {
                questionsArr = [];
            }
            
            // Controlar que el usuario no se le repita la misma pregunta dos veces en una misma sesión
            if (questionsArr.current.includes(question)) {
                fetchQuestion();
            } else {
                questionsArr.current.push(data.question);
                setTriggerAd(() => triggerAd + 1);
            }

        }

        if (error) {
            console.error("Error");
            console.log(error);
        }
    }

    async function askForReview() {

        const dateStorage = await AsyncStorage.getItem("@launch-app-review");
        if (dateStorage) {
            // Si existe asyncStorage, entonces comprobar si cumple la condición y entonces mostrar el rating modal.
            if (new Date().getTime() >= parseInt(JSON.parse(dateStorage))) {
                showRatingModal();
                let date = new Date();
                date.setDate(new Date().getDate() + 10);
                await AsyncStorage.setItem("@launch-app-review", JSON.stringify(date.getTime()));    
            }
        } else {
            // Si no existe asyncStorage, entonces implementarlo y mostrar el rating modal.
            showRatingModal();
            let date = new Date();
            date.setDate(new Date().getDate() + 10);
            await AsyncStorage.setItem("@launch-app-review", JSON.stringify(date.getTime()));
        }

    }

    async function showRatingModal() {
        InAppReview.RequestInAppReview().then(async () => {

        }).catch((error) => {
            console.log(error);
        });
    }

    useEffect(() => {
        askForReview();
    }, [])

    return (

        <ImageBackground source={require("../assets/background2.jpg")} resizeMode="cover"
            style={{
                width: '100%',
                height: '100%',
                flex: 1
            }}>

            <View style={{
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: StatusBar.currentHeight,
                paddingHorizontal: 40,
                paddingVertical: 80,
                flex: 1,
            }}>
                <BannerAd
                    unitId={adUnitId/* TestIds.BANNER */}
                    size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                    requestOptions={{
                        requestNonPersonalizedAdsOnly: true,
                    }}
                />

                <View>
                    <Text
                        numberOfLines={2}
                        style={{
                            fontSize: 55,
                            color: "#e9eaec",
                            fontFamily: "heading",
                            textAlign: "center",
                        }}>
                        {user}
                    </Text>
                </View>

                <View style={{
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    backgroundColor: "#e9eaec",
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                }}>
                    <Text
                        style={{
                            fontSize: 30,
                            fontFamily: "text",
                            letterSpacing: -1.5,

                        }}>
                        {question}
                    </Text>

                </View>

                <View
                    style={{
                        // justifyContent: "flex-end",
                        // alignItems: "flex-end",
                        // backgroundColor: "green"
                    }}>
                    <TouchableOpacity
                        onPress={() => fetchQuestion()}>
                        <Image
                            style={{
                                width: 150,
                                height: 150,
                                resizeMode: "contain",
                            }}
                            source={require('../assets/siguiente.png')}
                        />
                    </TouchableOpacity>
                </View>


            </View>
            <View style={{ paddingHorizontal: 8, alignItems: "flex-end" }}>
                <Text style={{ fontWeight: "bold" }}>v1.0.1</Text>
            </View>

        </ImageBackground>
    )
}