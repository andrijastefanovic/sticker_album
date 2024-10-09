import React, { useEffect, useState } from "react";
import axios from "axios";
import "../duplicates.css"

const Duplicates = () =>{
    const user = JSON.parse(localStorage.getItem("korisnik"));
    const ekipe = ["Angola", "Dominican Republic", "Italy", "Philippines",
    "China", "Puerto Rico", "Serbia", "South Sudan",
    "Greece", "Jordan", "New Zealand", "USA",
    "Egypt", "Lithuania", "Mexico", "Montenegro",
    "Australia", "Finland", "Germany", "Japan",
    "Cape Verde","Georgia", "Slovenia", "Venezuela",
    "Brazil", "Iran", "Côte d'Ivoire", "Spain",
    "Canada", "France", "Latvia", "Lebanon"];
    const [stickers2, setStickers2] = useState([]);
    useEffect(() => {
        const fetchData = async () =>{
            const response1 = await axios.post("http://localhost:3001/stickers/zalepljeneSlicice", { idUser: user.idUser });
            let tempList = [];
            for(let i = 0; i < response1.data.slicice.length; i++){
                tempList.push(response1.data.slicice[i].idIgr);
            }
            const response2 = await axios.post("http://localhost:3001/stickers/nezalepljeneSlicice", { idUser: user.idUser });
            let tempList2 = [];
            for(let i = 0; i < response2.data.slicice.length; i++){
                if(tempList.includes(response2.data.slicice[i].idIgr)) tempList2.push(response2.data.slicice[i].idIgr);
            }
            
            let allSlicice = [];
            for(let i = 0; i < ekipe.length; i++){
                const response = await axios.post("http://localhost:3001/stickers/sliciceEkipa", {ekipa: ekipe[i]});
                allSlicice = allSlicice.concat(response.data.slicice);
            }
            let duplicates = [];
            for(let i = 0; i < allSlicice.length; i++){
                if(tempList2.includes(allSlicice[i].idIgr)) duplicates.push(allSlicice[i]);
            }
            setStickers2(duplicates);
        }
        fetchData();
    }, []);

    return (
        <div className="content">
          <div className="image-grid">
            {stickers2.map((sticker, index) => (
              <img
                key={index}
                src={`./pictures/${sticker.picture1}`}
                alt={`Sticker ${index}`}
              />
            ))}
          </div>
        </div>
      );
}

export default Duplicates;