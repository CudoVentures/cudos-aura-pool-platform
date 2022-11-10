import axios from 'axios'
import JwtDecode from 'jwt-decode'

const LOCAL_STORAGE_ACCESS_TOKEN = 'cudos_aura_service_storage_access_token';

export function setDefaultAuthorization() {
    axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN)}`;
}

export function setTokenInStorage(token) {
    localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN, token)
    setDefaultAuthorization();
}

export function decodeStorageToken() {
    return localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN) && JwtDecode(localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN));
}

setDefaultAuthorization();

export default axios;
