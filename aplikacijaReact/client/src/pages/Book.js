import React, { useState, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import axios from 'axios';
import '../book.css';
import { useNavigate } from 'react-router-dom';
import BookContent from './BookContent';

const Book = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [currentStickerIndex, setCurrentStickerIndex] = useState(0);
  const [stickersTeam, setStickersTeam] = useState(null);
  const [refreshBookContent, setRefreshBookContent] = useState(false);
  const [resultsTeam, setResultsTeam] = useState([]);
  const [hoveredSticker, setHoveredSticker] = useState(null); // State to track hovered sticker

  const navigate = useNavigate();
  let number = 0;

  const teams = ["Angola", "Angola", "Dominican Republic", "Dominican Republic", "Italy", "Italy", "Philippines", "Philippines",
    "China", "China", "Puerto Rico", "Puerto Rico", "Serbia", "Serbia", "South Sudan", "South Sudan",
    "Greece", "Greece", "Jordan", "Jordan", "New Zealand", "New Zealand", "USA", "USA",
    "Egypt", "Egypt", "Lithuania", "Lithuania", "Mexico", "Mexico", "Montenegro", "Montenegro",
    "Australia", "Australia", "Finland", "Finland", "Germany", "Germany", "Japan", "Japan",
    "Cape Verde", "Cape Verde", "Georgia", "Georgia", "Slovenia", "Slovenia", "Venezuela", "Venezuela",
    "Brazil", "Brazil", "Iran", "Iran", "Côte d'Ivoire", "Côte d'Ivoire", "Spain", "Spain",
    "Canada", "Canada", "France", "France", "Latvia", "Latvia", "Lebanon", "Lebanon",
    "Special", "Special"];

  const totalPages = teams.length;

  const triggerOnFlip = (page) => {
    const event = { data: page };
    handlePageFlip(event);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 2);
    }
  };

  const user = JSON.parse(localStorage.getItem("korisnik"));
  let len = stickersTeam != null ? stickersTeam.length : 0;

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 2);
    }
  };

  const currentSticker = stickersTeam != null && stickersTeam.length > 0 ? stickersTeam[currentStickerIndex] : null;

  const fetchStickersForTeam = async (team) => {
    try {
      const response = await axios.post("http://localhost:3001/stickers/nezalepljeneSliciceEkipa", {
        ekipa: team,
        idUser: user.idUser,
      });

      const response1 = await axios.post("http://localhost:3001/stickers/dohvatiRezultateEkipe", {ekipa: teams[currentPage]});
      
      console.log(response1.data.rezultati);
      setResultsTeam(response1.data.rezultati);
      console.log(resultsTeam);
      console.log("REQUEST SENT");

      const response2 = await axios.post("http://localhost:3001/stickers/ponudjeneSlicice", {
        idUser: user.idUser,
      });
      const nezalepljeneSlicice = response.data.slicice.filter(item => !response2.data.slicice.some(offered => offered.idNez == item.idNez));
      console.log(response.data.slicice);
      setStickersTeam(nezalepljeneSlicice);
    } catch (error) {
      console.error('Error fetching stickers:', error);
    }
  };

  useEffect(() => {
    const currentTeam = teams[currentPage];
    fetchStickersForTeam(currentTeam);
  }, [currentPage]);

  const incrementStickerIndex = () => {
    if (currentStickerIndex < len - 1) {
      setCurrentStickerIndex(currentStickerIndex + 1);
    }
  };

  const decrementStickerIndex = () => {
    if (currentStickerIndex > 0) {
      setCurrentStickerIndex(currentStickerIndex - 1);
    }
  };

  const zalepiSlicicu = async () => {
    try {
      const response = await axios.post("http://localhost:3001/stickers/zalepiSlicicu", {
        idUser: user.idUser,
        idIgr: currentSticker.idIgr,
        idNez: currentSticker.idNez,
      });
      const currentTeam = teams[currentPage];
      number++;
      fetchStickersForTeam(currentTeam);
      const response2 = await axios.post("http://localhost:3001/stickers/zalepljeneSliciceEkipa", { ekipa: teams[currentPage], idUser: user.idUser });
      if(response2.data.slicice.length == 12){
        const response3 = await axios.post("http://localhost:3001/users/dodajKorisnikuKesicu", { idUser: user.idUser, packsToOpen: user.packsToOpen });
        localStorage.setItem("korisnik", JSON.stringify(response3.data.apdejtovanKorisnik));
        user.packsToOpen++;
      };
      len = stickersTeam != null ? stickersTeam.length : 0;
      setRefreshBookContent(!refreshBookContent);
      if (currentStickerIndex > len) {
        setCurrentStickerIndex(len - 1);
      }

    } catch (error) {
      console.error('Error zalepiSlicicu:', error);
    }
  };

  const handleStickerClick = (sticker) => {
    if(sticker.ekipa != 'Special'){
    localStorage.setItem("igrac", JSON.stringify(sticker));
    navigate('/player');
    }
  };

  const handlePageFlip = (e) => {
    setCurrentPage(e.data);
  };

  const handleMouseEnter = (sticker) => {
    setHoveredSticker(sticker);
  };

  const handleMouseLeave = () => {
    setHoveredSticker(null);
  };

  return (
    <div className='under'>
      <div className="book">
        <HTMLFlipBook
          width={500 / 2}
          height={1050 / 2}
          minWidth={300 / 2}
          maxWidth={1000}
          minHeight={630 / 2}
          maxHeight={2100}
          size="stretch"
          maxShadowOpacity={0.5}
          showCover={false}
          mobileScrollSupport={false}
          page={currentPage}
          onChangePage={(e) => setCurrentPage(e)}
          onFlip={handlePageFlip}
        >
          {teams.map((team, index) => (
            <div key={index} className={`page ${index % 2 === 0 ? 'page-left' : 'page-right'}`}>
              <BookContent
                team={team}
                left={index % 2 === 0 ? 1 : 0}
                number={number}
                refreshBookContent={refreshBookContent}
                setRefreshBookContent={setRefreshBookContent}
              />
            </div>
          ))}
        </HTMLFlipBook>

        <div className='next'>
        <div className='results'>
          {resultsTeam.map((result, index) => {
            const isTim1CurrentTeam = result.tim1 === teams[currentPage];
            const isTim2CurrentTeam = result.tim2 === teams[currentPage];

            return (
              <div key={index} className='result-item'>
                {result.odigrano === 1 ? (
                  <a href={result.link} target="_blank" rel="noopener noreferrer">
                    <div>
                    {isTim1CurrentTeam ? <strong>{result.tim1}</strong> : result.tim1} - {isTim2CurrentTeam ? <strong>{result.tim2}</strong> : result.tim2} {result.poeni1} - {result.poeni2}
                    </div>
                  </a>
                ) : (
                  <div>
                    {isTim1CurrentTeam ? <strong>{result.tim1}</strong> : result.tim1} - {isTim2CurrentTeam ? <strong>{result.tim2}</strong> : result.tim2} TO BE PLAYED
                  </div>
                )}
              </div>
            );
          })}
        </div>

          {currentSticker && (
            <div className="book-stickers">
              <h2>Stickers</h2>
              <div className="sticker-hover"
              onMouseEnter={() => handleMouseEnter(currentSticker)}
              onMouseLeave={handleMouseLeave}>
                
              
              <div>
                <img
                  src={`./pictures/${currentSticker.picture1}`}
                  alt={`Sticker ${currentSticker.idIgr}`}
                  
                />
                
                {hoveredSticker && (
                  <div className="hover-text" onClick={() => handleStickerClick(currentSticker)}>
                    <div>
                      {currentSticker.ime} {currentSticker.prezime}
                    </div>
                    <div>
                      {currentSticker.brSlicice}
                    </div>
                  </div>
                )}
              </div>
              </div>
              
              <div className="sticker-controls">
                <button onClick={decrementStickerIndex} disabled={currentStickerIndex === 0}>
                  Previous Sticker
                </button>
                <button onClick={zalepiSlicicu} disabled={len === 0}>
                  Put in Album
                </button>
                <button onClick={incrementStickerIndex} disabled={currentStickerIndex === len - 1 || len === 0}>
                  Next Sticker
                </button>
              </div>
              </div>
            
          )}
          
        </div>

      </div>

      <div className="book-navigation">
        <p>Pages {currentPage + 1}/{currentPage + 2} of {totalPages}</p>
      </div>

    </div>

  );
};

export default Book;
