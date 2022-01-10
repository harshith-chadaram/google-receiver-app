import React, {
    useState,
    useEffect,
    useMemo,
    useContext,
    createContext,
} from 'react';

const NAMESPACE = 'urn:x-cast:custom-cast-test';

const CastContext = createContext({
    castReady: false,
    context: null,
    videoId: '',
    startSeconds: 0,
    castMessage: {},
});

export const CastProvider = ({ children }) => {
    const [castReady, setReady] = useState(false);
    const [videoId, setVideoId] = useState('');
    const [startSeconds, setStartSeconds] = useState(0);
    const [castMessage, setCastMessage] = useState({});
    const [context, setContext] = useState(null);

    const providerValue = useMemo(
        () => ({
            castReady,
            context,
            videoId,
            startSeconds,
            castMessage,
        }),
        [castReady, context, videoId, startSeconds, castMessage]
    );

    useEffect(() => {
        setContext(window.cast.framework.CastReceiverContext.getInstance());
    }, []);

    useEffect(() => {
        // For development locally
        // if (process.env.NODE_ENV === 'development') {
        //     setReady(true);
        //     setVideoId('z6EchXyieos');
        //     return;
        // }

        // Load cast SDK on when deployed
        if (context) {
            const _listener = (e) => {
                setCastMessage(e.data);
                if (e.data.command === 'INIT_COMMUNICATION') {
                    setStartSeconds(e.data.startSeconds);
                    setReady(true);
                }
            };

            context.addCustomMessageListener(NAMESPACE, _listener);
            context.start();
            console.log('Cast started inside');
        }


    }, [context]);

    return (
        <CastContext.Provider value={providerValue}>{children}</CastContext.Provider>
    );
};


export const useCast = () => useContext(CastContext);
