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
exports.dodajKorisnikuKesicu = exports.loginUser = exports.registerUser = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const pool = promise_1.default.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'diplomski',
});
function registerUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(req.body);
            const [existingUser] = yield pool.query('SELECT * FROM korisnik WHERE username = ?', [req.body.username]);
            if (existingUser.length != 0) {
                res.json({ success: false, message: "Korisnicko ime je zauzeto" });
                return;
            }
            console.log("CHECK1");
            const currentDate = new Date();
            const oneYearAgo = new Date(currentDate);
            oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
            const [result] = yield pool.query("INSERT INTO Korisnik (username, password, datumPoslednjegOtvaranja, packsToOpen) VALUES (?, ?, ?, 0)", [req.body.username, req.body.password, oneYearAgo]);
            console.log("CHECK2");
            if (result.affectedRows == 1) {
                res.json({ success: true, message: "Registracija je uspela!" });
                return;
            }
            else {
                res.json({ success: false, message: "Registracija nije uspela!" });
                return;
            }
        }
        catch (error) {
            console.error(error);
            res.json({ success: false, message: "Greska na serveru" });
            return;
        }
    });
}
exports.registerUser = registerUser;
function loginUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const [loginUser] = yield pool.query("SELECT * FROM Korisnik WHERE username = ? AND password = ?", [req.body.username, req.body.password]);
        if (loginUser.length == 0) {
            res.json({ success: false, message: "Wrong username or password!" });
            return;
        }
        else {
            res.json({ success: true, message: "Login successful!", user: loginUser[0] });
            return;
        }
    });
}
exports.loginUser = loginUser;
function dodajKorisnikuKesicu(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const [change] = yield pool.query("UPDATE Korisnik Set packsToOpen = ? where idUser = ?", [req.body.packsToOpen + 1, req.body.idUser]);
        const [apdejtovanKorisnik] = yield pool.query("SELECT * FROM Korisnik WHERE Korisnik.idUser = ?", [req.body.idUser]);
        res.json({ message: "Dodata kesica!", apdejtovanKorisnik: apdejtovanKorisnik[0] });
    });
}
exports.dodajKorisnikuKesicu = dodajKorisnikuKesicu;
