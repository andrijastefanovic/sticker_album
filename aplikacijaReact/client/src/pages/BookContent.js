import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../bookcontent.css';

const BookContent = ({ team, left, number, refreshBookContent, setRefreshBookContent }) => {
  const [stickersTeam, setStickersTeam] = useState([]);
  const [userStickers, setUserStickers] = useState([]);
  const [hoveredSticker, setHoveredSticker] = useState(null); 
  const navigate = useNavigate();
  let numberStickerChange = number;

  const user = JSON.parse(localStorage.getItem("korisnik"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("http://localhost:3001/stickers/sliciceEkipa", { ekipa: team });
        setStickersTeam(response.data.slicice);
        const response2 = await axios.post("http://localhost:3001/stickers/zalepljeneSliciceEkipa", { ekipa: team, idUser: user.idUser });
        let userStickersArr = response2.data.slicice.map(item => item.idIgr);
        setUserStickers(userStickersArr);
      } catch (error) {
        console.error("Error fetching stickers:", error);
      }
    };

    fetchData();
  }, [team, user.idUser, numberStickerChange, refreshBookContent]);

  let displayedStickers;
  if (left === 1) {
    displayedStickers = stickersTeam.slice(0, 6);
  } else if (left === 0) {
    displayedStickers = stickersTeam.slice(6);
  }

  const isUserHasSticker = (stickerId) => {
    return userStickers.includes(stickerId);
  };

  const handleStickerClick = (sticker) => {
    if (isUserHasSticker(sticker.idIgr) && sticker.ekipa != 'Special') {
      localStorage.setItem("igrac", JSON.stringify(sticker));
      navigate('/player'); 
    }
  };

  const handleMouseEnter = (sticker) => {
    setHoveredSticker(sticker);
  };

  const handleMouseLeave = () => {
    setHoveredSticker(null);
  };

  return (
    <div>
      <div className="img-container">
        {displayedStickers.map((sticker, index) => (
          <div
            className="sticker-container"
            key={sticker.idIgr}
            onMouseEnter={() => handleMouseEnter(sticker)}
            onMouseLeave={handleMouseLeave}
          >
            <img
              className="img"
              src={
                isUserHasSticker(sticker.idIgr)
                  ? `./pictures/${sticker.picture1}`
                  : './pictures/default.png'
              }
              alt={sticker.ime}
              
            />
            {!isUserHasSticker(sticker.idIgr) && (
              <div className="sticker-number">
                {sticker.brSlicice}
              </div>
            )}
            {hoveredSticker === sticker && (
              <div className="hover-text" onClick={() => handleStickerClick(sticker)}>
                <div>
                  {sticker.ime} {sticker.prezime}
                </div>
                <div>
                  {sticker.brSlicice}
                </div>
              </div>

              
            )}
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookContent;
