import React from 'react';
import '../player.css';

const Player = () => {
    const player = JSON.parse(localStorage.getItem('igrac'));
    console.log(player);

    return (
        <div className="playerPage">
            <img
                src={`./pictures/${player.picture1}`}
                alt={`${player.ime} ${player.prezime}`}
            />
            <div className="playerData">
                <div className="playerInfoRow">
                    <span className="playerLabel">First name:</span>
                    <span className="playerValue">{player.ime}</span>
                </div>
                <div className="playerInfoRow">
                    <span className="playerLabel">Last name:</span>
                    <span className="playerValue">{player.prezime}</span>
                </div>
                <div className="playerInfoRow">
                    <span className="playerLabel">Height:</span>
                    <span className="playerValue">{player.visina}</span>
                </div>
                <div className="playerInfoRow">
                    <span className="playerLabel">Weight:</span>
                    <span className="playerValue">{player.tezina}</span>
                </div>
                <div className="playerInfoRow">
                    <span className="playerLabel">Position:</span>
                    <span className="playerValue">{player.pozicija}</span>
                </div>
                <div className="playerInfoRow">
                    <span className="playerLabel">National team:</span>
                    <span className="playerValue">{player.ekipa}</span>
                </div>
                <div className="playerInfoRow">
                    <span className="playerLabel">Club:</span>
                    <span className="playerValue">{player.klub}</span>
                </div>
            </div>
        </div>
    );
};

export default Player;
