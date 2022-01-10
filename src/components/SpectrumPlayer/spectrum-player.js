
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useCast } from '../../context/cast-context';
import Loader from '../Loader/loader';
import './spectrum.css'
const SpectrumPlayer = () => {
    const { context, castReady, startSeconds, castMessage } = useCast();
    useEffect(() => {
        console.log(castMessage)
    }, [castMessage])

    return (
        <div className='spectrum'>
            <cast-media-player></cast-media-player>
        </div>
    )

}
export default SpectrumPlayer;