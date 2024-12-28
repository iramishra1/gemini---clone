import { createContext, useState } from "react";  
import runChat from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
    const [input, setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [prevPrompts, setPrevPrompts] = useState([]); 
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");

    const processResponse = (response) => {
        let responseArray = response.split("**");
        let newResponse = "";
        for (let i = 0; i < responseArray.length; i++) {
            if (i === 0 || i % 2 !== 1) {
                newResponse += responseArray[i];
            } else {
                newResponse += `<b>${responseArray[i]}</b>`;
            }
        }
        return newResponse.split("*").join("<br>");
    };

    const typingEffect = (text) => {
        const words = text.split(" "); 
        setResultData(""); 
        words.forEach((word, index) => {
            setTimeout(() => {
                setResultData((prev) => prev + word + " "); 
            }, 75 * index); 
        });
    };

    const newChat = () => {
        setLoading(false)
        setShowResult(false)
    }

    const onSent = async (prompt) => {
        if (!input.trim() && !prompt) return;

        setLoading(true);
        setShowResult(true);

        const currentPrompt = prompt || input;
        setRecentPrompt(currentPrompt);

        if (!prevPrompts.includes(currentPrompt)) {
            setPrevPrompts((prev) => [...prev, currentPrompt]);
        }

        let response;

        try {
            response = await runChat(currentPrompt);
            const formattedResponse = processResponse(response);
            typingEffect(formattedResponse);
        } catch (error) {
            console.error("Error running chat:", error);
            setResultData("An error occurred while processing your request.");
        } finally {
            setLoading(false);
            setInput("");
        }
    };

    const contextValue = {
        input,
        setInput,
        recentPrompt,
        setRecentPrompt,
        prevPrompts,
        setPrevPrompts,
        showResult,
        setShowResult,
        loading,
        setLoading,
        resultData,
        setResultData,
        onSent,
        newChat
    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
};

export default ContextProvider;


