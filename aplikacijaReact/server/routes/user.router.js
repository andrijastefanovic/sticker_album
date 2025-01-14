"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const user_controller_1 = require("../controllers/user.controller");
const express_1 = __importDefault(require("express"));
const userRouter = express_1.default.Router();
exports.userRouter = userRouter;
userRouter.route("/register").post((req, res) => (0, user_controller_1.registerUser)(req, res));
userRouter.route("/login").post((req, res) => (0, user_controller_1.loginUser)(req, res));
userRouter.route("/dodajKorisnikuKesicu").post((req, res) => (0, user_controller_1.dodajKorisnikuKesicu)(req, res));
