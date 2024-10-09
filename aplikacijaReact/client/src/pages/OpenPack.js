import React, { useState, useEffect } from 'react';
import '../openPack.css';
import axios from 'axios';
import { useSpring, animated } from '@react-spring/web';

const OpenPack = () => {
  let user = JSON.parse(localStorage.getItem("korisnik"));

  const [stickers, setStickers] = useState([]);
  const [currentStickerIndex, setCurrentStickerIndex] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [newOpened, setNewOpened] = useState(0);
  const [oldOpened, setOldOpened] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showStickers, setShowStickers] = useState(false);

  const animationProps = useSpring({
    from: {scale: 1},
    to: {scale: isAnimating? 50 : 1},
    config: { duration: 1000 },
    onRest: () => {
      if (isAnimating) {
        setIsAnimating(false);
        handleOpenPack();
        setShowStickers(true);
      }
    }
  });

  useEffect(() => {
    const threeHoursAgo = new Date();
    threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);

    if (user.datumPoslednjegOtvaranja && new Date(user.datumPoslednjegOtvaranja) > threeHoursAgo) {
      const timePassed = new Date() - new Date(user.datumPoslednjegOtvaranja);
      let remainingTime;
      if (user.packsToOpen === 0) remainingTime = 3 * 60 * 60 * 1000 - timePassed;
      else remainingTime = 0;

      if (remainingTime > 0) {
        setIsButtonDisabled(true);
        setTimeLeft(Math.ceil(remainingTime / 1000));
        const timer = setInterval(() => {
          setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        return () => clearInterval(timer);
      }
    }

    if(stickers.length == 0) setIsButtonDisabled(false);
    else setIsButtonDisabled(true);
    setTimeLeft(0);
  }, [user]);

  const handleOpenPack = async () => {
    if (user.idUser === undefined) return;
    const response1 = await axios.post("http://localhost:3001/stickers/zalepljeneSlicice", { idUser: user.idUser });
    const response2 = await axios.post("http://localhost:3001/stickers/nezalepljeneSlicice", { idUser: user.idUser });

    const response = await axios.post("http://localhost:3001/stickers/otvoriKesicu", { idUser: user.idUser, packsToOpen: user.packsToOpen });
    const openedPack = response.data.slicice;

    const stickStickers = response1.data.slicice;
    const unstickStickers = response2.data.slicice;
    const oldStickers = openedPack.filter((item) => (stickStickers.some(sticked => sticked.idIgr === item.idIgr) || unstickStickers.some(unsticked => unsticked.idIgr === item.idIgr)));
    setOldOpened(oldStickers.length);
    setNewOpened(5 - oldStickers.length);
    localStorage.setItem("korisnik", JSON.stringify(response.data.apdejtovanKorisnik));
    user = JSON.parse(localStorage.getItem("korisnik"));
    
    setIsButtonDisabled(true);
    setStickers(openedPack);
  };

  const handlePrevious = () => {
    if (currentStickerIndex > 0) {
      setCurrentStickerIndex(currentStickerIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentStickerIndex < stickers.length - 1) {
      setCurrentStickerIndex(currentStickerIndex + 1);
    }
  };

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    return `${hours.toString().padStart(1, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleButtonClick = () => {
    setIsAnimating(true);
  };

  return (
    <div className="open-pack">
      <div className='stickers'>
        {showStickers ? (
          stickers.map((sticker, index) => (
            <img
              key={index}
              src={`./pictures/${sticker.picture1}`}
              alt={`${sticker.picture1}`}
            />
          ))
        ) : (
          <animated.img src="./pictures/pack.png" alt="Pack" className="pack-image" style={animationProps} />
        )}
      </div>
      <button onClick={handleButtonClick} disabled={isButtonDisabled}>
        Open Pack
      </button>
      <div>Time until next pack: {formatTime(timeLeft)}</div>
      {newOpened + oldOpened === 5 &&
        <div>New opened: {newOpened}  Old opened: {oldOpened}</div>
      }
    </div>
  );
};

export default OpenPack;
