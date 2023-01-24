import { makeAutoObservable } from 'mobx';

export enum SuperAdminCollectionsTableType {
    APPROVED = 1,
    QUEUED = 2,
    REJECTED = 3,
}

export default class SuperAdminCollectionsPageStore {

    selectedTableType: SuperAdminCollectionsTableType;

    constructor() {
        this.selectedTableType = SuperAdminCollectionsTableType.QUEUED;

        makeAutoObservable(this);
    }

    onClickShowApproved = () => {
        this.selectedTableType = SuperAdminCollectionsTableType.APPROVED;
    }

    onClickShowQueued = () => {
        this.selectedTableType = SuperAdminCollectionsTableType.QUEUED;
    }

    onClickShowRejected = () => {
        this.selectedTableType = SuperAdminCollectionsTableType.REJECTED;
    }

    isSelectedTableApproved() {
        return this.selectedTableType === SuperAdminCollectionsTableType.APPROVED;
    }

    isSelectedTableQueued() {
        return this.selectedTableType === SuperAdminCollectionsTableType.QUEUED;
    }

    isSelectedTableRejected() {
        return this.selectedTableType === SuperAdminCollectionsTableType.REJECTED;
    }
}
