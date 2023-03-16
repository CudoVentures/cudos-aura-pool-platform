import BigNumber from 'bignumber.js';
import { CURRENCY_DECIMALS } from 'cudosjs';
import { runInAction } from 'mobx';
import numeral from 'numeral';
import AppRoutes from '../../app-routes/entities/AppRoutes';
import { CHAIN_DETAILS } from './Constants';
import S from './Main';

const QUERY_PATTERN = '?p=';

export default class ProjectUtils {

    static TRANSITION_DURATION = 400;
    static MOMENT_FORMAT_DATE_AND_TIME = 'DD.MM.yyyy, HH:mm';
    static MOMENT_FORMAT_DATE = 'DD.MM.yyyy';
    static DATEPICKER_FORMAT_DATE_AND_TIME = 'dd.MM.yyyy, HH:mm';
    static DATEPICKER_FORMAT_DATE = 'dd.MM.yyyy';
    static NUMERAL_USD = '$0,0.00';
    static CUDOS_CURRENCY_DIVIDER = new BigNumber(1).shiftedBy(CURRENCY_DECIMALS);
    static ON_DEMAND_MINTING_SERVICE_FEE_IN_CUDOS = new BigNumber(1);

    static makeBgImgStyle(url: string) {
        return {
            'backgroundImage': `url("${url}")`,
        };
    }

    static copyInput(inputN: HTMLElement) {
        inputN.focus();
        inputN.select();
        document.execCommand('copy');
        inputN.blur();
    }

    static async copyText(text: string) {
        if (navigator.clipboard !== undefined) {
            await navigator.clipboard.writeText(text);
            return;
        }

        const inputN = document.createElement('textarea');
        inputN.style.width = '0';
        inputN.style.height = '0';
        inputN.style.position = 'fixed';
        inputN.style.overflow = 'hidden';
        inputN.style.opacity = '0';
        inputN.value = text;
        document.body.appendChild(inputN);
        ProjectUtils.copyInput(inputN);
        document.body.removeChild(inputN);
    }

    static downloadUrl(url: string, filename = S.Strings.EMPTY) {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    static makeUrlExplorer(cudosWalletAddress: string) {
        return `${CHAIN_DETAILS.EXPLORER_URL}/accounts/${cudosWalletAddress}`;
    }

    static makeUrlMiningFarm(miningFarmId: string) {
        return `${AppRoutes.CREDIT_MINING_FARM}/${miningFarmId}`;
    }

    static makeUrlCollection(collectionId: string) {
        return `${AppRoutes.CREDIT_COLLECTION}/${collectionId}`;
    }

    static makeUrl(page: string, keys: string | string[], values: string | string[], wipe = false) {
        if (keys === undefined) {
            window.location.href = page;
        }

        if (keys.splice === undefined) {
            keys = [keys];
            values = [values];
        }

        let i;
        let pair;
        const queryMap = new Map();
        let queryArray;

        for (i = keys.length; i-- > 0;) {
            keys[i] = encodeURIComponent(keys[i]);
            values[i] = encodeURIComponent(values[i]);
        }

        if (wipe === false) {
            queryArray = getwalletStoreQueryArray();
            for (i = queryArray.length; i-- > 0;) {
                pair = queryArray[i].split('=');
                queryMap.set(pair[0], pair[1]);
            }
        }
        queryArray = [];
        for (i = 0; i < keys.length; ++i) {
            queryArray.push(`${keys[i]}=${values[i]}`);
            queryMap.delete(keys[i]);
        }

        queryMap.forEach((value, key) => {
            queryArray.push(`${key}=${value}`);
        });

        return page + QUERY_PATTERN + btoa(queryArray.join('&'));
    }

    static redirect(page: string, keys: string | string[], values: string | string[], wipe: boolean) {
        window.location.href = ProjectUtils.makeUrl(page, keys, values, wipe);
    }

    static getQueryParam(key: string) {
        const queryArray = getQueryArray();
        for (let pair, i = queryArray.length; i-- > 0;) {
            pair = queryArray[i].split('=');
            if (decodeURIComponent(pair[0]) === key) { return decodeURIComponent(pair[1]); }
        }

        return null;
    }

    static redirectToUrl(url: string, newTab: boolean) {
        if (newTab !== true) {
            window.location.href = url;
            return; walletStore
        }

        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
    }

    static stripHtml(html: string, node: HTMLElement) {
        node = node !== undefined ? node : document.createElement('div');
        node.innerHTML = html;
        return (node.textContent || node.innerText || S.Strings.EMPTY).trim();
    }

    static isLandscape() {
        return document.documentElement.clientWidth / document.documentElement.clientHeight > 1.0;
    }

    static isPortrait() {
        return document.documentElement.clientWidth / document.documentElement.clientHeight < 1.0;
    }

    static requestAnimationFrame(callback: () => any) {
        requestAnimationFrame(() => {
            requestAnimationFrame(callback);
        });
    }

    static shortenAddressString(str: string, maxLength: number) {
        const strLen = str.length;

        if (strLen <= maxLength - 3) {
            return str;
        }

        const leftStr = str.slice(0, maxLength - 6);
        const rightStr = str.slice(strLen - 3);

        return `${leftStr}...${rightStr}`;
    }

    static makeTimestampsToday(): { timestampFrom: number, timestampTo: number } {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        date.clearTime();
        date.setTime(date.getTime() - 1);
        const timestampTo = date.getTime();

        date.setDate(date.getDate() - 1);
        const timestampFrom = date.getTime() + 1;

        return { timestampFrom, timestampTo };
    }

    static makeTimestampsWeek(): { timestampFrom: number, timestampTo: number } {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        date.clearTime();
        date.setTime(date.getTime() - 1);
        const timestampTo = date.getTime();

        date.setDate(date.getDate() - 7);
        const timestampFrom = date.getTime() + 1;

        return { timestampFrom, timestampTo };
    }

    static makeTimestampsMonth(): { timestampFrom: number, timestampTo: number } {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        date.clearTime();
        date.setTime(date.getTime() - 1);
        const timestampTo = date.getTime();

        date.setDate(date.getDate() - 30);
        const timestampFrom = date.getTime() + 1;

        return { timestampFrom, timestampTo };
    }

    static formatUsd(usd: BigNumber): string {
        return numeral(usd.toFixed(4)).format(ProjectUtils.NUMERAL_USD);
    }

    static getEndOfTodaysTimestamp() {
        const date = new Date();
        date.clearTime();
        date.setDate(date.getDate() + 1);
        return date.getTime() - 1;
    }

}

export async function runInActionAsync(callback: () => void) {
    return new Promise < void >((resolve) => {
        runInAction(() => {
            callback();
            resolve();
        });
    });
}

function getQueryArray() {
    const hashIndex = document.URL.indexOf('#');
    const url = hashIndex === -1 ? document.URL : document.URL.substring(0, hashIndex);

    const queryStringStartIndex = url.indexOf(QUERY_PATTERN);
    if (queryStringStartIndex === -1) {
        return [];
    }

    const queryString = url.substring(queryStringStartIndex + QUERY_PATTERN.length);
    return atob(queryString).split('&');
}
