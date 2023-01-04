import { action, makeAutoObservable } from 'mobx';

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

    onClickShowApproved = action(() => {
        this.selectedTableType = SuperAdminCollectionsTableType.APPROVED;
    })

    onClickShowQueued = action(() => {
        this.selectedTableType = SuperAdminCollectionsTableType.QUEUED;
    })

    onClickShowRejected = action(() => {
        this.selectedTableType = SuperAdminCollectionsTableType.REJECTED;
    })

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
