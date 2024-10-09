"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dohvatiRezultateEkipe = exports.sveSlicice = exports.korisnikoveRazmene = exports.ponudjeneSlicice = exports.obrisiRazmene = exports.obrisiSlicicuIzZamene = exports.promeniVlasnikaSlicice = exports.dohvatiSlicicuZaRazmenu = exports.dohvatiZelje = exports.dohvatiPonude = exports.dohvatiRazmene = exports.pozeliSlicice = exports.ponudiSlicice = exports.napraviRazmenu = exports.sliciceEkipa = exports.zalepiSlicicu = exports.otvoriKesicu = exports.nezalepljeneSliciceEkipa = exports.nezalepljeneSlicice = exports.zalepljeneSliciceEkipa = exports.zalepljeneSlicice = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const pool = promise_1.default.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'diplomski',
});
function zalepljeneSlicice(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const [slicice] = yield pool.query("SELECT * FROM Zalepljena where idUser = ?", [req.body.idUser]);
        res.json({ message: "Zalepljene korisnikove slicice:", slicice: slicice });
        return;
    });
}
exports.zalepljeneSlicice = zalepljeneSlicice;
function nezalepljeneSlicice(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const [slicice] = yield pool.query("SELECT * FROM Nezalepljena where idUser = ? order by Nezalepljena.idIgr", [req.body.idUser]);
        res.json({ message: "Nezalepljene korisnikove slicice:", slicice: slicice });
        return;
    });
}
exports.nezalepljeneSlicice = nezalepljeneSlicice;
function otvoriKesicu(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield pool.getConnection();
        try {
            yield connection.beginTransaction();
            const [slicice] = yield pool.query("SELECT * FROM Igrac ORDER BY RAND() LIMIT 5");
            const idNezovi = [];
            for (let i = 0; i < slicice.length; i++) {
                const element = slicice[i];
                //            // console.log(element);
                const [izvuci] = yield pool.query("INSERT INTO Nezalepljena (idUser, idigr) VALUES (?, ?)", [req.body.idUser, element.idIgr]);
                const [lastId] = yield pool.query("SELECT LAST_INSERT_ID() AS idNez");
                //           // console.log(lastId);
                idNezovi.push(lastId[0].idNez);
            }
            if (req.body.packsToOpen > 0) {
                const [change] = yield pool.query("UPDATE Korisnik Set packsToOpen = ? where idUser = ?", [req.body.packsToOpen - 1, req.body.idUser]);
            }
            else {
                const currentDate = new Date();
                const [change] = yield pool.query("UPDATE Korisnik Set datumPoslednjegOtvaranja = ? where idUser = ?", [currentDate, req.body.idUser]);
            }
            const [apdejtovanKorisnik] = yield pool.query("SELECT * FROM Korisnik WHERE Korisnik.idUser = ?", [req.body.idUser]);
            // console.log(apdejtovanKorisnik)
            yield connection.commit();
            res.json({ message: "Otvorena kesica!", slicice: slicice, inserti: idNezovi, apdejtovanKorisnik: apdejtovanKorisnik[0] });
            return;
        }
        catch (error) {
            yield connection.rollback();
            console.error("Error: " + error);
            res.json({ message: "Greska!" });
            return;
        }
        finally {
            connection.release();
        }
    });
}
exports.otvoriKesicu = otvoriKesicu;
function zalepljeneSliciceEkipa(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const [slicice] = yield pool.query("Select Igrac.* from Zalepljena, Igrac where Zalepljena.idUser = ? and Igrac.idIgr = Zalepljena.idIgr and Igrac.ekipa = ?", [req.body.idUser, req.body.ekipa]);
        res.json({ message: "Korisnikove zalepljene slicice za ovu ekipu", slicice: slicice });
        return;
    });
}
exports.zalepljeneSliciceEkipa = zalepljeneSliciceEkipa;
function nezalepljeneSliciceEkipa(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(req.body);
        const [slicice] = yield pool.query("Select distinct Igrac.*, Nezalepljena.idNez from Igrac inner join Nezalepljena on Igrac.idIgr = Nezalepljena.idIgr left join Zalepljena on Igrac.idIgr = Zalepljena.idIgr where Nezalepljena.idUser = ? and Igrac.ekipa = ? and Nezalepljena.idIgr not in (select idIgr from Zalepljena where idUser = ? )", [req.body.idUser, req.body.ekipa, req.body.idUser]);
        // console.log(slicice);
        res.json({ message: "Korisnikove zalepljene slicice za ovu ekipu", slicice: slicice });
        return;
    });
}
exports.nezalepljeneSliciceEkipa = nezalepljeneSliciceEkipa;
function zalepiSlicicu(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield pool.getConnection();
        try {
            yield connection.beginTransaction();
            const [result] = yield pool.query("INSERT INTO Zalepljena (idUser, idIgr) VALUES (?, ?)", [req.body.idUser, req.body.idIgr]);
            const [result2] = yield pool.query("DELETE FROM Nezalepljena where idNez = ?", [req.body.idNez]);
            yield connection.commit();
            res.json({ message: "Zalepljena slicica!" });
            return;
        }
        catch (error) {
            console.error("Error: " + error);
            yield connection.rollback();
            res.json({ message: "Greska!" });
            return;
        }
        finally {
            connection.release();
        }
    });
}
exports.zalepiSlicicu = zalepiSlicicu;
function sliciceEkipa(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const [slicice] = yield pool.query("Select * from Igrac where Igrac.ekipa = ?", [req.body.ekipa]);
        res.json({ message: "Korisnikove zalepljene slicice za ovu ekipu", slicice: slicice });
        return;
    });
}
exports.sliciceEkipa = sliciceEkipa;
function napraviRazmenu(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const [razmena] = yield pool.query("INSERT INTO Razmena (idUser, acceptDuplicates, processed) VALUES (?, ?, 0)", [req.body.idUser, req.body.acceptDuplicates]);
        const [lastId] = yield pool.query("SELECT LAST_INSERT_ID() AS idRaz");
        res.json({ idRaz: lastId[0].idRaz, idUser: lastId[0].idUser });
        return;
    });
}
exports.napraviRazmenu = napraviRazmenu;
function pozeliSlicice(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield pool.getConnection();
        try {
            yield connection.beginTransaction();
            for (let i = 0; i < req.body.ponuda.length; i++) {
                const [ponuda] = yield pool.query("INSERT INTO Zelja_Razmena (idRaz, idIgr) VALUES (?, ?)", [req.body.idRaz, req.body.ponuda[i]]);
            }
            yield connection.commit();
            res.json({ message: "Transakcija uspela" });
        }
        catch (error) {
            yield connection.rollback();
            res.json({ message: "Greska!" });
        }
        finally {
            connection.release();
        }
        return;
    });
}
exports.pozeliSlicice = pozeliSlicice;
function ponudiSlicice(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield pool.getConnection();
        try {
            yield connection.beginTransaction();
            for (let i = 0; i < req.body.ponuda.length; i++) {
                const [ponuda] = yield pool.query("INSERT INTO Ponuda_Razmena (idRaz, idNez, idIgr) VALUES (?, ?, ?)", [req.body.idRaz, req.body.ponuda[i].idNez, req.body.ponuda[i].idIgr]);
            }
            yield connection.commit();
            res.json({ message: "Transakcija uspela" });
        }
        catch (error) {
            yield connection.rollback();
            res.json({ message: "Greska!" });
        }
        finally {
            connection.release();
        }
        return;
    });
}
exports.ponudiSlicice = ponudiSlicice;
function dohvatiRazmene(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const [razmene] = yield pool.query("Select * from razmena where processed = 0");
        res.json({ razmene: razmene });
        return;
    });
}
exports.dohvatiRazmene = dohvatiRazmene;
function dohvatiPonude(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const [ponude] = yield pool.query("Select idRaz, idIgr from ponuda_razmena");
        res.json({ ponude: ponude });
        return;
    });
}
exports.dohvatiPonude = dohvatiPonude;
function dohvatiZelje(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const [zelje] = yield pool.query("Select idRaz, idIgr from zelja_razmena");
        res.json({ zelje: zelje });
        return;
    });
}
exports.dohvatiZelje = dohvatiZelje;
function dohvatiSlicicuZaRazmenu(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const [slicica] = yield pool.query("Select idNez from ponuda_razmena where idIgr = ? and idRaz = ? limit 1", [req.body.idIgr, req.body.idRaz]);
        res.json({ slicica: slicica });
        return;
    });
}
exports.dohvatiSlicicuZaRazmenu = dohvatiSlicicuZaRazmenu;
function promeniVlasnikaSlicice(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(req.body);
        const odgovor = yield pool.query("Update nezalepljena set idUser = ? where idNez = ?", [req.body.idUser, req.body.idNez]);
        res.json({ odgovor: odgovor });
        return;
    });
}
exports.promeniVlasnikaSlicice = promeniVlasnikaSlicice;
function obrisiSlicicuIzZamene(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const odgovor = yield pool.query("Delete from ponuda_razmena where idNez = ?", [req.body.idNez]);
        res.json({ odgovor: odgovor });
        return;
    });
}
exports.obrisiSlicicuIzZamene = obrisiSlicicuIzZamene;
function obrisiRazmene(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        yield pool.query("Delete from ponuda_razmena where idRaz >= 0");
        yield pool.query("Delete from zelja_razmena where idRaz >= 0");
        yield pool.query("Update razmena set processed = 1 where idRaz >= 0");
        return;
    });
}
exports.obrisiRazmene = obrisiRazmene;
function ponudjeneSlicice(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const [slicice] = yield pool.query("select idNez from ponuda_razmena join razmena where idUser = ?", [req.body.idUser]);
        res.json({ "slicice": slicice });
        return;
    });
}
exports.ponudjeneSlicice = ponudjeneSlicice;
function korisnikoveRazmene(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const [razmene] = yield pool.query("Select * from razmena where idUser = ? and processed = 0", [req.body.idUser]);
        res.json({ "razmene": razmene });
        return;
    });
}
exports.korisnikoveRazmene = korisnikoveRazmene;
function sveSlicice(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const [slicice] = yield pool.query("Select * from Igrac order by idIgr");
        res.json({ message: "Sve slicice", slicice: slicice });
        return;
    });
}
exports.sveSlicice = sveSlicice;
function dohvatiRezultateEkipe(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const [rezultati] = yield pool.query("Select * from rezultat where tim1 = ? or tim2 = ? order by idRez", [req.body.ekipa, req.body.ekipa]);
        res.json({ rezultati: rezultati });
        return;
    });
}
exports.dohvatiRezultateEkipe = dohvatiRezultateEkipe;
