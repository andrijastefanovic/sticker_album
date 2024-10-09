import { registerUser, loginUser, dodajKorisnikuKesicu } from "../controllers/user.controller";
import express from "express";

const userRouter = express.Router();

userRouter.route("/register").post(
    (req, res) => registerUser(req, res)
)

userRouter.route("/login").post(
    (req, res) => loginUser(req, res)
)

userRouter.route("/dodajKorisnikuKesicu").post(
    (req, res) => dodajKorisnikuKesicu(req, res)
)


export {userRouter}
