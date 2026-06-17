import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "",
    withCredentials: true
})

export async function register({username, email, password}){

    try {
        const response = await api.post('/api/auth/register',{username,email,password});
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export async function login({username, email, password}){

    try {
        const response = await api.post('/api/auth/login',{email,password});
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export async function logout(){

    try {
        const response = await api.post('/api/auth/logout');
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export async function getMe() {
    try {
        const response = await api.get("/api/auth/get-me")
        return response.data
    } catch (err) {
        // not logged in — just return null, don't log noise
        return null
    }
}