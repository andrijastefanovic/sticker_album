import React, {useState} from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios"; 
import "../register.css";
import { useNavigate } from "react-router-dom";



function Register(){

    const navigate = useNavigate();

    const[RegisterErrorMessage, setRegisterErrorMessage] = useState("");

    const initialValues = {
        username: "",
        password1: "",
        password2:"",
    };

    const validationSchema = Yup.object().shape({
        username: Yup.string().required(),
        password1: Yup.string().required(),
        password2: Yup.string().required(),
    });

    const onSubmit = async (data) => {
        const {username, password1, password2} = data
        if(password1 != password2) {setRegisterErrorMessage("Passwords are not the same!"); return;}
        const response = await axios.post("http://localhost:3001/users/register", {username: username, password: password1});
        navigate("/");
    };

    return(
        <div className="content">
            <div className="Register">
            <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
        >
            <Form className="formContainer">
            <label>Username: </label>
            <ErrorMessage name="username" component="span" />
            <Field
                id="username"
                name="username"
                placeholder="Username"
            />
            <label>Password: </label>
            <ErrorMessage name="password" component="span" />
            <Field
                id="password1"
                name="password1"
                placeholder="Password"
                type="password"
            />
            <Field
                id="password2"
                name="password2"
                placeholder="Confirm password"
                type="password"
            />
            <button type="submit">Register</button>
            <label className="error">{RegisterErrorMessage}</label>
            </Form>
        </Formik>
        </div>
        </div>
    );

}

export default Register;