"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stickersRouter = void 0;
const express_1 = __importDefault(require("express"));
const stickers_controller_1 = require("../controllers/stickers.controller");
const stickersRouter = express_1.default.Router();
exports.stickersRouter = stickersRouter;
stickersRouter.route("/zalepljeneSlicice").post((req, res) => (0, stickers_controller_1.zalepljeneSlicice)(req, res));
stickersRouter.route("/nezalepljeneSlicice").post((req, res) => (0, stickers_controller_1.nezalepljeneSlicice)(req, res));
stickersRouter.route("/zalepljeneSliciceEkipa").post((req, res) => (0, stickers_controller_1.zalepljeneSliciceEkipa)(req, res));
stickersRouter.route("/nezalepljeneSliciceEkipa").post((req, res) => (0, stickers_controller_1.nezalepljeneSliciceEkipa)(req, res));
stickersRouter.route("/otvoriKesicu").post((req, res) => (0, stickers_controller_1.otvoriKesicu)(req, res));
stickersRouter.route("/zalepiSlicicu").post((req, res) => (0, stickers_controller_1.zalepiSlicicu)(req, res));
stickersRouter.route("/sliciceEkipa").post((req, res) => (0, stickers_controller_1.sliciceEkipa)(req, res));
stickersRouter.route("/napraviRazmenu").post((req, res) => (0, stickers_controller_1.napraviRazmenu)(req, res));
stickersRouter.route("/ponudiSlicice").post((req, res) => (0, stickers_controller_1.ponudiSlicice)(req, res));
stickersRouter.route("/pozeliSlicice").post((req, res) => (0, stickers_controller_1.pozeliSlicice)(req, res));
stickersRouter.route("/dohvatiRazmene").get((req, res) => (0, stickers_controller_1.dohvatiRazmene)(req, res));
stickersRouter.route("/dohvatiPonude").get((req, res) => (0, stickers_controller_1.dohvatiPonude)(req, res));
stickersRouter.route('/dohvatiZelje').get((req, res) => (0, stickers_controller_1.dohvatiZelje)(req, res));
stickersRouter.route('/dohvatiSlicicuZaRazmenu').post((req, res) => (0, stickers_controller_1.dohvatiSlicicuZaRazmenu)(req, res));
stickersRouter.route('/promeniVlasnikaSlicice').post((req, res) => (0, stickers_controller_1.promeniVlasnikaSlicice)(req, res));
stickersRouter.route('/obrisiSlicicuIzZamene').post((req, res) => (0, stickers_controller_1.obrisiSlicicuIzZamene)(req, res));
stickersRouter.route("/obrisiRazmene").get((req, res) => (0, stickers_controller_1.obrisiRazmene)(req, res));
stickersRouter.route("/ponudjeneSlicice").post((req, res) => (0, stickers_controller_1.ponudjeneSlicice)(req, res));
stickersRouter.route("/korisnikoveRazmene").post((req, res) => (0, stickers_controller_1.korisnikoveRazmene)(req, res));
stickersRouter.route("/sveSlicice").get((req, res) => (0, stickers_controller_1.sveSlicice)(req, res));
stickersRouter.route("/dohvatiRezultateEkipe").post((req, res) => (0, stickers_controller_1.dohvatiRezultateEkipe)(req, res));