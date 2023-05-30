import axios from 'axios'
import JwtDecode from 'jwt-decode'

const LOCAL_STORAGE_ACCESS_TOKEN = 'cudos_markets_service_storage_access_token';

export const enum BackendErrorType {
    WRONG_USER_OR_PASSWORD = '1',
    NOT_FOUND = '2',
    WRONG_OLD_PASSWORD = '3',
    WRONG_VERIFICATION_TOKEN = '4',
    WRONG_NONCE_SIGNATURE = '5',
    EMAIL_ALREADY_IN_USE = '6',

    COLLECTION_CREATE_ERROR = '7',
    COLLECTION_DENOM_EXISTS_ERROR = '8',
    COLLECTION_WRONG_DENOM_ERROR = '9',
    DATA_SERVICE_ERROR = '10',

    FARM_CREATION_ERROR = '11',

    WRONG_SERVICE_PARAMETERS = '12',
    GRAPHQL_COLLECTION_DENOM_NOT_FOUND_ERROR = '13',
    COLLECTION_DENOM_NOT_FOUND_ERROR = '14',

    ACCOUNT_LOCKED = '15',
}

export function parseBackendErrorType(axiosError): BackendErrorType {
    return axiosError.response?.data?.message;
}

export function setDefaultAuthorization() {
    axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN)}`;
}

export function setTokenInStorage(token) {
    localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN, token)

    if (token === null) {
        localStorage.removeItem(LOCAL_STORAGE_ACCESS_TOKEN);
    }

    setDefaultAuthorization();
}

export function decodeStorageToken() {
    return localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN) && JwtDecode(localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN));
}

setDefaultAuthorization();

export default axios;
