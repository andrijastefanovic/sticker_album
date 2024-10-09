import express from "express"
import { zalepljeneSlicice, zalepljeneSliciceEkipa, nezalepljeneSlicice, nezalepljeneSliciceEkipa, otvoriKesicu, zalepiSlicicu, sliciceEkipa, napraviRazmenu, ponudiSlicice, pozeliSlicice, dohvatiRazmene, dohvatiPonude, dohvatiZelje, dohvatiSlicicuZaRazmenu, promeniVlasnikaSlicice, obrisiSlicicuIzZamene, obrisiRazmene, ponudjeneSlicice, korisnikoveRazmene, sveSlicice, dohvatiRezultateEkipe} from "../controllers/stickers.controller"

const stickersRouter = express.Router();

stickersRouter.route("/zalepljeneSlicice").post(
    (req, res) => zalepljeneSlicice(req,res)
)

stickersRouter.route("/nezalepljeneSlicice").post(
    (req, res) => nezalepljeneSlicice(req,res)
)

stickersRouter.route("/zalepljeneSliciceEkipa").post(
    (req, res) => zalepljeneSliciceEkipa(req,res)
)

stickersRouter.route("/nezalepljeneSliciceEkipa").post(
    (req, res) => nezalepljeneSliciceEkipa(req,res)
)

stickersRouter.route("/otvoriKesicu").post(
    (req, res) => otvoriKesicu(req,res)
)

stickersRouter.route("/zalepiSlicicu").post(
    (req, res) => zalepiSlicicu(req,res)
)

stickersRouter.route("/sliciceEkipa").post(
    (req, res) => sliciceEkipa(req, res)
)

stickersRouter.route("/napraviRazmenu").post(
    (req, res) => napraviRazmenu(req, res)
)

stickersRouter.route("/ponudiSlicice").post(
    (req, res) => ponudiSlicice(req, res)
)

stickersRouter.route("/pozeliSlicice").post(
    (req, res) => pozeliSlicice(req, res)
)

stickersRouter.route("/dohvatiRazmene").get(
    (req, res) => dohvatiRazmene(req, res)
)

stickersRouter.route("/dohvatiPonude").get(
    (req, res) => dohvatiPonude(req, res)
)

stickersRouter.route('/dohvatiZelje').get(
    (req, res) => dohvatiZelje(req, res)
)

stickersRouter.route('/dohvatiSlicicuZaRazmenu').post(
    (req, res) => dohvatiSlicicuZaRazmenu(req, res)
)

stickersRouter.route('/promeniVlasnikaSlicice').post(
    (req, res) => promeniVlasnikaSlicice(req, res)
)

stickersRouter.route('/obrisiSlicicuIzZamene').post(
    (req, res) => obrisiSlicicuIzZamene(req, res)
)

stickersRouter.route("/obrisiRazmene").get(
    (req, res) => obrisiRazmene(req, res)
);

stickersRouter.route("/ponudjeneSlicice").post(
    (req, res) => ponudjeneSlicice(req, res)
)

stickersRouter.route("/korisnikoveRazmene").post(
    (req, res) => korisnikoveRazmene(req, res)
)

stickersRouter.route("/sveSlicice").get(
    (req, res) => sveSlicice(req, res)
)

stickersRouter.route("/dohvatiRezultateEkipe").post(
    (req, res) => dohvatiRezultateEkipe(req, res)
)

export {stickersRouter}