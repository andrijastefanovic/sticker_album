import mysql, { Pool, RowDataPacket, OkPacket} from 'mysql2/promise';
import express from "express";

const pool: Pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'diplomski',
});


async function registerUser(req:express.Request, res:express.Response) {
    try{
        console.log(req.body);
        
        const [existingUser] = await pool.query<RowDataPacket[]>('SELECT * FROM korisnik WHERE username = ?', [req.body.username]);
        if(existingUser.length != 0){
            res.json({success: false, message: "Korisnicko ime je zauzeto"});
            return;
        }

        console.log("CHECK1");
        const currentDate = new Date();
        const oneYearAgo = new Date(currentDate);
        oneYearAgo.setFullYear(currentDate.getFullYear() - 1);

        const [result] = await pool.query<OkPacket>("INSERT INTO Korisnik (username, password, datumPoslednjegOtvaranja, packsToOpen) VALUES (?, ?, ?, 0)", [req.body.username, req.body.password, oneYearAgo]);
        console.log("CHECK2")
        if(result.affectedRows == 1){
            res.json({success: true, message: "Registracija je uspela!"});
            return;
        }
        else {
            res.json({success: false, message: "Registracija nije uspela!"});
            return;}
    }
    catch (error){
        console.error(error)
        res.json({success: false, message: "Greska na serveru"});
        return;
    }
    
}

async function loginUser(req:express.Request, res:express.Response){
    const [loginUser] = await pool.query<RowDataPacket[]>("SELECT * FROM Korisnik WHERE username = ? AND password = ?", [req.body.username, req.body.password]);
    if(loginUser.length == 0){
        res.json({success: false, message: "Wrong username or password!"});
        return;
    }
    else{
        res.json({success: true, message: "Login successful!", user: loginUser[0]});
        return;
    }
}

async function dodajKorisnikuKesicu(req:express.Request, res:express.Response) {

    const [change] = await pool.query<OkPacket>("UPDATE Korisnik Set packsToOpen = ? where idUser = ?", [req.body.packsToOpen + 1, req.body.idUser]);
    const [apdejtovanKorisnik] = await pool.query<RowDataPacket[]>("SELECT * FROM Korisnik WHERE Korisnik.idUser = ?", [req.body.idUser]);
    res.json({message: "Dodata kesica!", apdejtovanKorisnik: apdejtovanKorisnik[0]});
    
}




export {registerUser, loginUser, dodajKorisnikuKesicu}