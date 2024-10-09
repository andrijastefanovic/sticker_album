import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios"; 
import "../login.css";
import { useNavigate } from "react-router-dom";



function Login({updateUser}){

    const navigate = useNavigate();

    const[LoginErrorMessage, setLoginErrorMessage] = useState("");

    const initialValues = {
        username: "",
        password: "",
    };

    const validationSchema = Yup.object().shape({
        username: Yup.string().required(),
        password: Yup.string().required(),
    });

    const onSubmit = async (data) => {

        const response = await axios.post("http://localhost:3001/users/login", {"username": data.username, "password": data.password});
        console.log(response);
        if(response.data.success == true){
            localStorage.setItem("korisnik", JSON.stringify(response.data.user));
            updateUser();
            navigate("/book");
        }
        else{
            setLoginErrorMessage(response.data.message);
        }
        
    };

    return(
        <div className="Login">
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
                id="password"
                name="password"
                placeholder="Password"
                type="password"
            />
            <button type="submit">Login</button>
            <label className="error">{LoginErrorMessage}</label>
            </Form>
            
            
        </Formik>
        
        
        </div>
    );

}

export default Login;