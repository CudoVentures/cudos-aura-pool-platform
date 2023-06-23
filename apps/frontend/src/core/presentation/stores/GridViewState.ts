import { action, makeAutoObservable } from 'mobx';
import TableState from './TableState';
import S from '../../utilities/Main';

export enum GRID_SETTING {
    DENSE,
    LOOSE
}

export default class GridViewState {

    static DEFAULT_LOOSE_SETTING_SIZE = 12;
    static DEFAULT_DENSE_SETTING_SIZE = 20;

    fetchCallback: () => void;
    looseColumnCount: number;
    denseColumnCount: number;
    maxRows: number;

    gridSetting: number;
    isFetching: boolean;

    tableState: TableState;

    constructor(fetchCallback: () => void, looseColumnCount: number, denseColumnCount: number, maxRows: number) {
        this.fetchCallback = fetchCallback;
        this.looseColumnCount = looseColumnCount;
        this.denseColumnCount = denseColumnCount;
        this.maxRows = maxRows;

        this.gridSetting = GRID_SETTING.LOOSE;
        this.isFetching = false;

        this.tableState = new TableState(S.NOT_EXISTS, [], fetchCallback, this.calculateItemsPerPageByGridSettings());

        makeAutoObservable(this);
    }

    setGridSettingAndPreviewCount(setting: number) {
        this.gridSetting = setting;
        this.tableState.tableFilterState.itemsPerPage = this.calculateItemsPerPageByGridSettings();

        this.fetchCallback();
    }

    calculateItemsPerPageByGridSettings(): number {
        switch (this.gridSetting) {
            case GRID_SETTING.DENSE:
                return this.denseColumnCount * this.maxRows
            case GRID_SETTING.LOOSE:
            default:
                return this.looseColumnCount * this.maxRows;
        }
    }

    getFrom() {
        return this.tableState.tableFilterState.from;
    }

    getItemsPerPage() {
        return this.tableState.tableFilterState.itemsPerPage;
    }

    getItemCount() {
        return this.tableState.tableFilterState.total;
    }

    getGridSettingClass() {
        return this.gridSetting === GRID_SETTING.LOOSE ? `GridColumns${this.looseColumnCount}` : `GridColumns${this.denseColumnCount}`;
    }

    checkIsGridSettingSelected(setting: number): boolean {
        return this.gridSetting === setting;
    }

    setIsLoading(isFetching: boolean) {
        this.isFetching = isFetching;
    }

    setTotalItems(count: number) {
        this.tableState.tableFilterState.setTotal(count);
    }
}
