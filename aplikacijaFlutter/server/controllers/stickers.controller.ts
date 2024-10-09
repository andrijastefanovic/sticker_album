import mysql, { Pool, RowDataPacket, OkPacket, PoolConnection} from 'mysql2/promise';
import express from "express";
import { findAncestor } from 'typescript';

const pool: Pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'diplomski',
  });


async function zalepljeneSlicice(req:express.Request, res:express.Response){
    const [slicice] = await pool.query<RowDataPacket[]>("SELECT * FROM Zalepljena where idUser = ?", [req.body.idUser]);
    res.json({message:"Zalepljene korisnikove slicice:", slicice: slicice});
    return;
}

async function nezalepljeneSlicice(req:express.Request, res:express.Response){
    const [slicice] = await pool.query<RowDataPacket[]>("SELECT * FROM Nezalepljena where idUser = ? order by Nezalepljena.idIgr", [req.body.idUser]);
    res.json({message:"Nezalepljene korisnikove slicice:", slicice: slicice});
    return;
}

async function otvoriKesicu(req:express.Request, res:express.Response){
    const connection: PoolConnection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [slicice] = await pool.query<RowDataPacket[]>("SELECT * FROM Igrac ORDER BY RAND() LIMIT 5");
        const idNezovi:number[] = [];
        for (let i = 0; i < slicice.length; i++) {
            const element = slicice[i];
//            // console.log(element);
            const [izvuci] = await pool.query<OkPacket>("INSERT INTO Nezalepljena (idUser, idigr) VALUES (?, ?)", [req.body.idUser, element.idIgr]);
            const [lastId] = await pool.query<RowDataPacket[]>("SELECT LAST_INSERT_ID() AS idNez");
 //           // console.log(lastId);
            idNezovi.push(lastId[0].idNez);
        }

        if(req.body.packsToOpen > 0){
            const [change] = await pool.query<OkPacket>("UPDATE Korisnik Set packsToOpen = ? where idUser = ?", [req.body.packsToOpen - 1, req.body.idUser]);
        }

        else{
            const currentDate = new Date();
            const [change] = await pool.query<OkPacket>("UPDATE Korisnik Set datumPoslednjegOtvaranja = ? where idUser = ?", [currentDate, req.body.idUser]);
        }

        


        const [apdejtovanKorisnik] = await pool.query<RowDataPacket[]>("SELECT * FROM Korisnik WHERE Korisnik.idUser = ?", [req.body.idUser]);
        
        // console.log(apdejtovanKorisnik)

        await connection.commit();
        
        

        res.json({message: "Otvorena kesica!", slicice: slicice, inserti: idNezovi, apdejtovanKorisnik: apdejtovanKorisnik[0]});
        return;
        
    } catch (error){
        await connection.rollback();
        console.error("Error: " + error);
        res.json({message: "Greska!"});
        return;
    }
    finally{
        connection.release();
    }
   

}

async function zalepljeneSliciceEkipa(req:express.Request, res:express.Response){
    const [slicice] = await pool.query<RowDataPacket[]>("Select Igrac.* from Zalepljena, Igrac where Zalepljena.idUser = ? and Igrac.idIgr = Zalepljena.idIgr and Igrac.ekipa = ?", [req.body.idUser, req.body.ekipa]);
    res.json({message: "Korisnikove zalepljene slicice za ovu ekipu", slicice: slicice});
    return;
}

async function nezalepljeneSliciceEkipa(req:express.Request, res:express.Response){
    // console.log(req.body);
    const [slicice] = await pool.query<RowDataPacket[]>("Select distinct Igrac.*, Nezalepljena.idNez from Igrac inner join Nezalepljena on Igrac.idIgr = Nezalepljena.idIgr left join Zalepljena on Igrac.idIgr = Zalepljena.idIgr where Nezalepljena.idUser = ? and Igrac.ekipa = ? and Nezalepljena.idIgr not in (select idIgr from Zalepljena where idUser = ? )", [req.body.idUser, req.body.ekipa, req.body.idUser]);
    // console.log(slicice);
    res.json({message: "Korisnikove zalepljene slicice za ovu ekipu", slicice: slicice});
    return;
}

async function zalepiSlicicu(req:express.Request, res:express.Response) {
    const connection: PoolConnection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [result] = await pool.query<OkPacket>("INSERT INTO Zalepljena (idUser, idIgr) VALUES (?, ?)", [req.body.idUser, req.body.idIgr]);
        const [result2] = await pool.query<OkPacket>("DELETE FROM Nezalepljena where idNez = ?", [req.body.idNez]);
        await connection.commit();
        res.json({message : "Zalepljena slicica!"});
        
        return; 
    } catch (error) {
        console.error("Error: " + error);
        await connection.rollback();
        
        res.json({message : "Greska!"});
        return;
        
    }
    finally{
        connection.release();
    }

   

    
}

async function sliciceEkipa(req:express.Request, res:express.Response){
    const [slicice] = await pool.query<RowDataPacket[]>("Select * from Igrac where Igrac.ekipa = ?", [req.body.ekipa]);
    res.json({message: "Korisnikove zalepljene slicice za ovu ekipu", slicice: slicice});
    return;
}

async function napraviRazmenu(req:express.Request, res:express.Response) {
    const [razmena] = await pool.query<OkPacket>("INSERT INTO Razmena (idUser, acceptDuplicates, processed) VALUES (?, ?, 0)", [req.body.idUser, req.body.acceptDuplicates]);
    const [lastId] = await pool.query<RowDataPacket[]>("SELECT LAST_INSERT_ID() AS idRaz");
    res.json({idRaz: lastId[0].idRaz, idUser: lastId[0].idUser});
    return;
}

async function pozeliSlicice(req:express.Request, res:express.Response) {
    const connection: PoolConnection = await pool.getConnection();
    try{
        await connection.beginTransaction();
        for(let i = 0; i < req.body.ponuda.length; i++){
            const [ponuda] = await pool.query<OkPacket>("INSERT INTO Zelja_Razmena (idRaz, idIgr) VALUES (?, ?)", [req.body.idRaz, req.body.ponuda[i]]);
        }
        await connection.commit();
        res.json({message:"Transakcija uspela"});

    }
    catch(error){
        await connection.rollback();
        res.json({message:"Greska!"})
    }
    finally{
        connection.release();
    }

    return;
    
    
}

async function ponudiSlicice(req:express.Request, res:express.Response) {
    const connection: PoolConnection = await pool.getConnection();
    try{
        await connection.beginTransaction();
        for(let i = 0; i < req.body.ponuda.length; i++){
            const [ponuda] = await pool.query<OkPacket>("INSERT INTO Ponuda_Razmena (idRaz, idNez, idIgr) VALUES (?, ?, ?)", [req.body.idRaz, req.body.ponuda[i].idNez, req.body.ponuda[i].idIgr]);
        }
        await connection.commit();
        res.json({message:"Transakcija uspela"});

    }
    catch(error){
        await connection.rollback();
        res.json({message:"Greska!"})
    }
    finally{
        connection.release();
    }

    return;
    
    
}

async function dohvatiRazmene(req:express.Request, res:express.Response) {
    const [razmene] = await pool.query<RowDataPacket[]>("Select * from razmena where processed = 0");
    res.json({razmene: razmene});
    return;
}

async function dohvatiPonude(req:express.Request, res:express.Response) {
    const [ponude] = await pool.query<RowDataPacket[]>("Select idRaz, idIgr from ponuda_razmena");
    res.json({ponude: ponude});
    return;
}

async function dohvatiZelje(req:express.Request, res:express.Response) {
    const [zelje] = await pool.query<RowDataPacket[]>("Select idRaz, idIgr from zelja_razmena");
    res.json({zelje: zelje});
    return;
}

async function dohvatiSlicicuZaRazmenu(req:express.Request, res:express.Response){
    const [slicica] = await pool.query<RowDataPacket[]>("Select idNez from ponuda_razmena where idIgr = ? and idRaz = ? limit 1", [req.body.idIgr, req.body.idRaz])
    res.json({slicica: slicica});
    return;
}

async function promeniVlasnikaSlicice(req:express.Request, res:express.Response) {
    console.log(req.body);
    const odgovor = await pool.query<OkPacket>("Update nezalepljena set idUser = ? where idNez = ?", [req.body.idUser, req.body.idNez]);
    res.json({odgovor: odgovor});
    return;
    
}

async function obrisiSlicicuIzZamene(req:express.Request, res:express.Response){
    const odgovor = await pool.query<OkPacket>("Delete from ponuda_razmena where idNez = ?", [req.body.idNez]);
    res.json({odgovor: odgovor});
    return;
    
}

async function obrisiRazmene(req:express.Request, res:express.Response) {

    await pool.query<OkPacket>("Delete from ponuda_razmena where idRaz >= 0");
    await pool.query<OkPacket>("Delete from zelja_razmena where idRaz >= 0");
    await pool.query<OkPacket>("Update razmena set processed = 1 where idRaz >= 0");
    return;
    
}

async function ponudjeneSlicice(req:express.Request, res:express.Response){
    const [slicice] = await pool.query<RowDataPacket[]>("select idNez from ponuda_razmena join razmena where idUser = ?", [req.body.idUser]);
    res.json({"slicice": slicice});
    return
}

async function korisnikoveRazmene(req:express.Request, res:express.Response){
    const [razmene] = await pool.query<RowDataPacket[]>("Select * from razmena where idUser = ? and processed = 0", [req.body.idUser]);
    res.json({"razmene": razmene});
    return;
}

async function sveSlicice(req:express.Request, res:express.Response){
    const [slicice] = await pool.query<RowDataPacket[]>("Select * from Igrac order by idIgr");
    res.json({message: "Sve slicice", slicice: slicice});
    return;
}

async function dohvatiRezultateEkipe(req:express.Request, res:express.Response) {
    const [rezultati] = await pool.query<RowDataPacket[]>("Select * from rezultat where tim1 = ? or tim2 = ? order by idRez", [req.body.ekipa, req.body.ekipa]);
    res.json({rezultati: rezultati});
    return;
}

export {zalepljeneSlicice, zalepljeneSliciceEkipa, nezalepljeneSlicice, nezalepljeneSliciceEkipa, otvoriKesicu, zalepiSlicicu, sliciceEkipa, napraviRazmenu,
ponudiSlicice, pozeliSlicice, dohvatiRazmene, dohvatiPonude, dohvatiZelje, dohvatiSlicicuZaRazmenu, promeniVlasnikaSlicice, obrisiSlicicuIzZamene, 
obrisiRazmene, ponudjeneSlicice, korisnikoveRazmene, sveSlicice, dohvatiRezultateEkipe}