import { makeAutoObservable } from 'mobx';

export enum EventTypeFilter {
    ALL = 1,
    TRANSFER = 2,
}

export enum Period {
    TODAY = 1,
    WEEK = 2,
    MONTH = 3
}

export default class CollectionEventFilterModel {
    eventType: EventTypeFilter;
    period: Period;

    constructor() {
        this.eventType = EventTypeFilter.ALL;
        this.period = Period.TODAY;

        makeAutoObservable(this);
    }

    static toJson(entity: CollectionEventFilterModel) {
        if (entity === null) {
            return null;
        }

        return {
            eventType: entity.eventType,
            period: entity.period,
        }
    }

    static fromJson(json): CollectionEventFilterModel {
        if (json === null) {
            return null;
        }

        const model = new CollectionEventFilterModel();

        model.eventType = parseInt(json.eventType || model.eventType);
        model.period = parseInt(json.period || model.period);

        return model;
    }

}
