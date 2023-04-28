import { action, makeAutoObservable, makeObservable, observable } from 'mobx';
import S from '../../utilities/Main';

/* eslint-disable max-classes-per-file */
export default class TableState {

    tableSortKeyToIndex: Map < number, number >;
    tableSortIndexToKey: Map < number, number >;
    @observable tableFilterState: TableFilterState;
    onUpdateTable: () => void;

    constructor(defaultSortKey: number, keys: Array < Array < number > >, callback: () => void, itemsPerPage = 10) {
        this.tableSortKeyToIndex = new Map();
        this.tableSortIndexToKey = new Map();

        keys.forEach((pair) => {
            this.tableSortKeyToIndex.set(pair[0], pair[1]);
            this.tableSortIndexToKey.set(pair[1], pair[0]);
        })

        this.tableFilterState = new TableFilterState(defaultSortKey, itemsPerPage);

        this.onUpdateTable = callback;

        makeObservable(this);
    }

    getTableSortKey(index: number) {
        return this.tableSortIndexToKey.get(index);
    }

    getTableSortIndex() {
        return this.tableSortKeyToIndex.get(Math.abs(this.tableFilterState.sortKey)) || S.NOT_EXISTS;
    }

    @action
    setSortMapping(keys: Array < Array < number > >) {
        this.tableSortKeyToIndex.clear();
        this.tableSortIndexToKey.clear();

        keys.forEach((pair) => {
            this.tableSortKeyToIndex.set(pair[0], pair[1]);
            this.tableSortIndexToKey.set(pair[1], pair[0]);
        })
    }

    isTableSortIndexClickable(index: number) {
        return this.tableSortIndexToKey.has(index);
    }

    @action
    updateTableSortDirection() {
        this.tableFilterState.sortKey *= -1;
        this.onUpdateTable();
    }

    @action
    updateTableSort(sortKey: number) {
        this.tableFilterState.sortKey = sortKey;
        this.onUpdateTable();
    }

    @action
    updateTablePage(from: number) {
        this.tableFilterState.from = from;
        this.onUpdateTable();
    }

    @action
    resetTablePaging() {
        this.tableFilterState.from = 0;
    }

}

export class TableFilterState {

    sortKey: number;
    itemsPerPage: number;
    from: number;
    total: number;

    constructor(sortKey: number, itemsPerPage = 10) {
        this.sortKey = sortKey;
        this.itemsPerPage = itemsPerPage;
        this.from = 0;
        this.total = 0;

        makeAutoObservable(this);
    }

    pageZero() {
        this.from = 0;
    }

    pageBack() {
        this.from = Math.max(0, this.from - this.itemsPerPage);
    }

    pageNext() {
        this.from = this.to();
    }

    to() {
        return this.from + this.itemsPerPage;
    }

    hasMore(): boolean {
        return this.to() < this.total;
    }

    goToLastPossbilePage(total) {
        this.from = Math.floor(total / this.total) * this.total;
    }

}
