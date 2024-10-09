import React, { useState, useEffect } from "react";
import axios from "axios";
import "../traderequest.css";

const TradeRequest = () => {
    const [stickers, setStickers] = useState([]);
    const [stickers2, setStickers2] = useState([]);
    const [stickers3, setStickers3] = useState([]);
    const [selectedItems1, setSelectedItems1] = useState([]);
    const [selectedItems2, setSelectedItems2] = useState([]);
    const [isChecked, setIsChecked] = useState(0);
    const ekipe = [
        "Angola", "Dominican Republic", "Italy", "Philippines",
        "China", "Puerto Rico", "Serbia", "South Sudan",
        "Greece", "Jordan", "New Zealand", "USA",
        "Egypt", "Lithuania", "Mexico", "Montenegro",
        "Australia", "Finland", "Germany", "Japan",
        "Cape Verde","Georgia", "Slovenia", "Venezuela",
        "Brazil", "Iran", "Côte d'Ivoire", "Spain",
        "Canada", "France", "Latvia", "Lebanon"
    ];
    const [hasRequest, setHasRequest] = useState(false);
    const user = JSON.parse(localStorage.getItem("korisnik"));

    useEffect(() => {
        const fetchData = async () => {
            const checkOffer = await axios.post("http://localhost:3001/stickers/korisnikoveRazmene", { idUser: user.idUser });
            console.log(checkOffer.data.razmene.length);
            if (checkOffer.data.razmene.length > 0) setHasRequest(true);
            const response1 = await axios.post("http://localhost:3001/stickers/zalepljeneSlicice", { idUser: user.idUser });
            const response2 = await axios.post("http://localhost:3001/stickers/nezalepljeneSlicice", { idUser: user.idUser });
            let allSlicice = [];

            for (let i = 0; i < ekipe.length; i++) {
                const response = await axios.post("http://localhost:3001/stickers/sliciceEkipa", { ekipa: ekipe[i] });
                allSlicice = allSlicice.concat(response.data.slicice);
            }
            setStickers(response1.data.slicice);
            setStickers2(response2.data.slicice);
            setStickers3(allSlicice);

            const initialSelected1 = response2.data.slicice.filter(item => response1.data.slicice.some(selected => selected.idIgr === item.idIgr));

            setSelectedItems1(initialSelected1);

            const initialSelected2 = allSlicice.filter(item => !response1.data.slicice.some(selected => selected.idIgr === item.idIgr)).map(item => item.idIgr);
            const orangeFields = response2.data.slicice.map(item => item.idIgr);
            const filteredInitialSelected2 = initialSelected2.filter(id => !orangeFields.includes(id));

            setSelectedItems2(filteredInitialSelected2);
        };

        fetchData();
    }, []);

    const handleGrid1ItemClick = (object) => {
        const index = selectedItems1.findIndex(item => item.idNez === object.idNez);

        if (index !== -1) {
            setSelectedItems1([...selectedItems1.slice(0, index), ...selectedItems1.slice(index + 1)]);
        } else {
            setSelectedItems1([...selectedItems1, object]);
        }
    };

    const handleGrid2ItemClick = (idIgr) => {
        if (selectedItems2.includes(idIgr)) {
            setSelectedItems2(selectedItems2.filter(item => item !== idIgr));
        } else {
            setSelectedItems2([...selectedItems2, idIgr]);
        }
    };

    const handleButtonClick = async () => {
      
        const response1 = await axios.post("http://localhost:3001/stickers/napraviRazmenu", { idUser: user.idUser, acceptDuplicates: isChecked });
        let idRaz = response1.data.idRaz
        const response2 = await axios.post("http://localhost:3001/stickers/ponudiSlicice", { ponuda: selectedItems1, idRaz: idRaz });
        const response3 = await axios.post("http://localhost:3001/stickers/pozeliSlicice", { ponuda: selectedItems2, idRaz: idRaz });
        

    };

    const renderFields = (items, selectedItems, handleClick) => {
        const rows = [];
        for (let i = 0; i < items.length; i += 5) {
            const rowItems = items.slice(i, i + 5);
            rows.push(
                <div key={i} className="grid-row">
                    {rowItems.map((item) => (
                        <div
                            key={item.idIgr}
                            className="grid-field"
                            style={{
                                backgroundColor: stickers.some(sticker => sticker.idIgr === item.idIgr) ? 'red' : stickers2.some(sticker => sticker.idIgr === item.idIgr) ? 'orange' : 'green',
                                border: selectedItems.includes(item.idIgr) ? '2px solid white' : '2px solid black'
                            }}
                            onClick={() => handleClick(item.idIgr)}
                        >
                            {item.idIgr}
                        </div>
                    ))}
                </div>
            );
        }
        return rows;
    };

    const renderFields2 = (items, selectedItems, handleClick) => {
        const rows = [];
        for (let i = 0; i < items.length; i += 5) {
            const rowItems = items.slice(i, i + 5);
            rows.push(
                <div key={i} className="grid-row">
                    {rowItems.map((item) => (
                        <div
                            key={item.idNez}
                            className="grid-field"
                            style={{
                                backgroundColor: stickers.some(sticker => sticker.idIgr === item.idIgr) ? 'red' : stickers2.some(sticker => sticker.idIgr === item.idIgr) ? 'orange' : 'green',
                                border: selectedItems.some(sticker => sticker.idNez === item.idNez) ? '2px solid white' : '2px solid black'
                            }}
                            onClick={() => handleClick(item)}
                        >
                            {item.idIgr}
                        </div>
                    ))}
                </div>
            );
        }
        return rows;
    };

    const handleCheckboxChange = () => {
      setIsChecked((isChecked + 1) % 2);
      console.log(isChecked);
    };

    return (
        <div className="content">
            {hasRequest ? (
                <div>
                    <h1>You have already made a request!</h1>
                </div>
            ) : (
                <div>
                    <h3>Legend</h3>
                    <div className="legend">
                        
                        <div className="legend-item">
                            <div className="legend-color stickers-in-album"></div>
                            <span>In album</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color stickers-not-in-album-unstuck"></div>
                            <span>In possession, not in album yet</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color stickers-not-in-album"></div>
                            <span>Missing</span>
                        </div>
                    </div>
                    <h3>Offering</h3>
                    <div className="grid-container">
                        {renderFields2(stickers2, selectedItems1, handleGrid1ItemClick)}
                    </div>
                    <h3>Requesting</h3>
                    <div className="grid-container">
                        {renderFields(stickers3, selectedItems2, handleGrid2ItemClick)}
                    </div>
                    <div>
                        
                        <label>Accept duplicates <input type="checkbox" className="checkboxDetail" checked={isChecked} onChange={handleCheckboxChange}></input></label>
                    </div>
                    <button onClick={handleButtonClick}>Make Request</button>
                </div>
            )}
        </div>
    );
};

export default TradeRequest;
