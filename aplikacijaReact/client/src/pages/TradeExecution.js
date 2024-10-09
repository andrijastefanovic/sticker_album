import axios from 'axios';
import React, { useEffect, useState } from 'react';

class TradeRequest {
    constructor(idRaz, idUser, acceptDuplicates) {
        this.idRaz = idRaz;
        this.idUser = idUser;
        this.wanted = [];
        this.offered = [];
        this.acceptDuplicates = acceptDuplicates;
    }
}

const TradeExecution = () => {
    const [requests, setRequests] = useState([]);
    const [start, setStart] = useState(0);

    function generateRandomList(mustBeUnique) {
        let list = [];
        while (list.length < 20) {
            let randomNumber = Math.floor(Math.random() * 100) + 1;
            if (!list.includes(randomNumber) || !mustBeUnique) {
                list.push(randomNumber);
            }
        }
        return list;
    }

    function removeCommonItems(arr1, arr2) {
        let commonItems = arr1.filter(item => arr2.includes(item));
        commonItems.forEach(item => {
            arr1.splice(arr1.indexOf(item), 1);
        });
        return arr1;
    }

    function removeFirstOccurrences(list1, list2) {
        const map = {};
        for (const item of list2) {
            map[item] = true;
        }
        return list1.filter(item => {
            if (map[item]) {
                delete map[item];
                return false;
            }
            return true;
        });
    }

    useEffect(() => {
        const fetchData = async () => {

            
            
            try {
                const response2 = await axios.get("http://localhost:3001/stickers/dohvatiPonude");
                const response3 = await axios.get("http://localhost:3001/stickers/dohvatiZelje");
                const response = await axios.get("http://localhost:3001/stickers/dohvatiRazmene");

                let tempList = response.data.razmene.map(item => new TradeRequest(item.idRaz, item.idUser, item.acceptDuplicates));
                setRequests(tempList);



                // Update TradeRequest instances with idIgr from response2
                setRequests(tempList => {
                    const updatedRequests = tempList.map(request => {
                        const matchingPonude = response2.data.ponude.filter(ponuda => ponuda.idRaz === request.idRaz);
                        if (matchingPonude.length > 0 && request.offered.length == 0) {
                            request.offered.push(...matchingPonude.map(ponuda => ponuda.idIgr));
                        }
                        return request;
                    });
                
                    tempList = updatedRequests; // Update tempList
                    return updatedRequests;
                });

                setRequests(tempList => {
                    const updatedRequests = tempList.map(request => {
                        const matchingZelje = response3.data.zelje.filter(zelja => zelja.idRaz === request.idRaz);
                        if (matchingZelje.length > 0 && request.wanted.length == 0) {
                            request.wanted.push(...matchingZelje.map(zelja => zelja.idIgr));
                        }
                        return request;
                    });
                
                    tempList = updatedRequests; // Update tempList
                    return updatedRequests;
                });


                setStart(1);


            } catch (error) {
                console.error("Error fetching data:", error);
            }
            

            // using test data
/*
            let tempList = []


            for(let i = 1; i <= 10; i++){
                tempList.push(new TradeRequest(i, i));
            }
            
            
            for(let i = 0; i < 10; i++){

                tempList[i].offered = generateRandomList(false);
                tempList[i].wanted = generateRandomList(true);
                tempList[i].offered = removeCommonItems(tempList[i].offered, tempList[i].wanted);

            }

            console.log(JSON.stringify(tempList))

*/

            
          

            

            
        };

        fetchData(); // Call the fetchData function to initiate the data fetching
    }, []); // The empty dependency array ensures the effect runs only once

    useEffect(() => {
        const execute = async () => {   

            if(start == 0) return;

            let completedList = [];

            let tradesToMake = [];

            let isComplete = false;

            let beginTradesToMake = 0;

        //    for(let i = 0; i < requests.length; i++) console.log(JSON.stringify(requests[i])); 

            while(!isComplete){


                isComplete = true;

                for(let i = 0; i < requests.length - 1; i++){
                    if (completedList.includes(requests[i].idRaz)) continue;
                    completedList.push(requests[i].idRaz);
                    let maxId = -1;
                    let maxValue = 0;
                    let solutionList1 = []
                    let solutionList2 = []
                    for(let j = i + 1; j < requests.length; j++){
                        if(completedList.includes(requests[j].idRaz)) continue;
                        const firstElementOffered = new Set(requests[i].offered);
                        const firstElementWanted = new Set(requests[i].wanted);
                        const secondElementOffered = new Set(requests[j].offered);
                        const secondElementWanted = new Set(requests[j].wanted);

                        
                        const common1 = Array.from(firstElementOffered).filter(element => secondElementWanted.has(element)); // Corrected
                        const common2 = Array.from(secondElementOffered).filter(element => firstElementWanted.has(element)); // Corrected
                        let max = Math.min(common1.length, common2.length);
    
                        if(max > maxValue) {                            
                            if(isComplete) isComplete = false;
                            maxValue = max;
                            maxId = j;
                            solutionList1 = common1.slice(0, max);
                            solutionList2 = common2.slice(0, max);
                            
                        }
                    }
                    if (maxId != -1){
                        completedList.push(requests[maxId].idRaz);
                        let newSolution = [requests[i].idRaz, requests[maxId].idRaz, solutionList1, solutionList2, requests[i].idUser, requests[maxId].idUser, i, maxId]
                        tradesToMake.push(newSolution);
                        
                    }
                }
    
                for(let i = beginTradesToMake; i < tradesToMake.length; i++){
                    requests[tradesToMake[i][6]].offered = removeFirstOccurrences(requests[tradesToMake[i][6]].offered, tradesToMake[i][2]);
                    requests[tradesToMake[i][6]].wanted = removeFirstOccurrences(requests[tradesToMake[i][6]].wanted, tradesToMake[i][3]);
                    requests[tradesToMake[i][7]].offered = removeFirstOccurrences(requests[tradesToMake[i][7]].offered, tradesToMake[i][3]);
                    requests[tradesToMake[i][7]].wanted = removeFirstOccurrences(requests[tradesToMake[i][7]].wanted, tradesToMake[i][2]);

                }

                completedList = [];

                beginTradesToMake = tradesToMake.length;

            }
            /*
            for(let i = 0; i < tradesToMake.length; i++) console.log(JSON.stringify(tradesToMake[i]))
            for(let i = 0; i < requests.length; i++) console.log(JSON.stringify(requests[i])); 
            */

            

                
            for(let i = 0; i < tradesToMake.length; i++){
                for(let j = 0; j < tradesToMake[i][2].length; j++){

                    console.log(j);

                    
                //    idNez = getIdNez(tradesToMake[i][2][j], tradesToMane[i][0]); // select idNez from ponuda_razmena where idIgr = tradesToMake[i][2][j] and idRaz = tradesToMake[i][0]

                    const response1 = await axios.post("http://localhost:3001/stickers/dohvatiSlicicuZaRazmenu", {idIgr: tradesToMake[i][2][j], idRaz: tradesToMake[i][0]});
                    
                    let idNez1 = response1.data.slicica[0].idNez
                    console.log(idNez1)
                    

                //    changeOwner(idNez, tradesToMake[i][5]); // update nezalepljena set idUser = tradesToMake[i][5] where nezalepljena.idNez = idNez

                    const response2 = await axios.post("http://localhost:3001/stickers/promeniVlasnikaSlicice", {idUser: tradesToMake[i][5], idNez: idNez1});
                    console.log(response2.data)

                //    deleteFromPonuda(idNez) //delete from ponuda_razmena where ponuda_razmena.idNez = idNez
                    
                    const response3 = await axios.post("http://localhost:3001/stickers/obrisiSlicicuIzZamene", {idNez: idNez1});
                    console.log(response3.data)

                //    idNez = getIdNez(tradesToMake[i][3][j], tradesToMake[i][1]); // select idNez from ponuda_razmena where idIgr = tradesToMake[i][3][j] and idRaz = tradesToMake[i][1]

                    const response4 = await axios.post("http://localhost:3001/stickers/dohvatiSlicicuZaRazmenu", {idIgr: tradesToMake[i][3][j], idRaz: tradesToMake[i][1]});
                    
                    let idNez2 = response4.data.slicica[0].idNez
                    console.log(idNez2)

                //    changeOwner(idNez, tradesToMake[i][4]); // update nezalepljena set idUser = tradesToMake[i][4] where nezalepljena.idNez = idNez

                    const response5 = await axios.post("http://localhost:3001/stickers/promeniVlasnikaSlicice", {idUser: tradesToMake[i][4], idNez: idNez2});
                    console.log(response5.data);

                //    deleteFromPonuda(idNez) //delete from ponuda_razmena where ponuda_razmena.idNez = idNez

                    const response6 = await axios.post("http://localhost:3001/stickers/obrisiSlicicuIzZamene", {idNez: idNez2});
                    console.log(response6.data)


                }
            }

            
                
        //    deleteAllTradeRequests();

        for(let i = 0; i < requests.length; i++){
            if(requests[i].offered.length == 0 || requests[i].wanted.length == 0 || requests[i].acceptDuplicates == 0) continue;
            for(let j = 0; j < requests.length; j++){
                if(i == j) continue;
                if(requests[j].offered.length == 0 || requests[j].acceptDuplicates == 0) continue;
                const firstElementWanted = new Set(requests[i].wanted);
                const secondElementOffered = new Set(requests[j].offered);
                const common = Array.from(secondElementOffered).filter(element => firstElementWanted.has(element));
                console.log(common);
                if(common.length == 0) continue;
                let solutionList1 = [];
                let solutionList2 = [];
                let max = Math.min(common.length, requests[i].offered.length);
                solutionList2 = common.slice(0, max);
                solutionList1 = requests[i].offered.slice(0, max);
                console.log(solutionList1);
                console.log(solutionList2);
                let newSolution = [requests[i].idRaz, requests[j].idRaz, solutionList1, solutionList2, requests[i].idUser, requests[j].idUser, i, j];
                requests[i].offered = removeFirstOccurrences(requests[i].offered, solutionList1);
                requests[i].wanted = removeFirstOccurrences(requests[i].wanted, solutionList2);
                requests[j].offered = removeFirstOccurrences(requests[j].offered, solutionList2);
                for(let k = 0; k < solutionList2.length; k++) requests[j].offered.push(solutionList2[k]);
                tradesToMake.push(newSolution);


                

    


            }
        }

        for(let i = beginTradesToMake; i < tradesToMake.length; i++){
            for(let j = 0; j < tradesToMake[i][2].length; j++){

                console.log(j);

                
            //    idNez = getIdNez(tradesToMake[i][2][j], tradesToMane[i][0]); // select idNez from ponuda_razmena where idIgr = tradesToMake[i][2][j] and idRaz = tradesToMake[i][0]

                const response1 = await axios.post("http://localhost:3001/stickers/dohvatiSlicicuZaRazmenu", {idIgr: tradesToMake[i][2][j], idRaz: tradesToMake[i][0]});
                
                let idNez1 = response1.data.slicica[0].idNez
                console.log(idNez1)
                

            //    changeOwner(idNez, tradesToMake[i][5]); // update nezalepljena set idUser = tradesToMake[i][5] where nezalepljena.idNez = idNez

                const response2 = await axios.post("http://localhost:3001/stickers/promeniVlasnikaSlicice", {idUser: tradesToMake[i][5], idNez: idNez1});
                console.log(response2.data)

            //    deleteFromPonuda(idNez) //delete from ponuda_razmena where ponuda_razmena.idNez = idNez
                
                const response3 = await axios.post("http://localhost:3001/stickers/obrisiSlicicuIzZamene", {idNez: idNez1});
                console.log(response3.data)

            //    idNez = getIdNez(tradesToMake[i][3][j], tradesToMake[i][1]); // select idNez from ponuda_razmena where idIgr = tradesToMake[i][3][j] and idRaz = tradesToMake[i][1]

                const response4 = await axios.post("http://localhost:3001/stickers/dohvatiSlicicuZaRazmenu", {idIgr: tradesToMake[i][3][j], idRaz: tradesToMake[i][1]});
                
                let idNez2 = response4.data.slicica[0].idNez
                console.log(idNez2)

            //    changeOwner(idNez, tradesToMake[i][4]); // update nezalepljena set idUser = tradesToMake[i][4] where nezalepljena.idNez = idNez

                const response5 = await axios.post("http://localhost:3001/stickers/promeniVlasnikaSlicice", {idUser: tradesToMake[i][4], idNez: idNez2});
                console.log(response5.data);

            //    deleteFromPonuda(idNez) //delete from ponuda_razmena where ponuda_razmena.idNez = idNez

                const response6 = await axios.post("http://localhost:3001/stickers/obrisiSlicicuIzZamene", {idNez: idNez2});
                console.log(response6.data)


            }
        }

            

            
            const response = await axios.get("http://localhost:3001/stickers/obrisiRazmene");
            console.log("DONE")
            

        };

        execute();

    }, [start]);

    return (
        <div className='content'>
            
        </div>
    );
}

export default TradeExecution;
