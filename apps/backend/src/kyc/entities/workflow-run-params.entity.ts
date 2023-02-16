export class WorkflowRunParamsEntity < T extends WorkflowRunParamsVxEntity > {

    version: number;
    params: T;

    constructor() {
        this.version = 1;
        this.params = null;
    }

    unwrap(): T {
        return this.params;
    }

    static wrap < V extends WorkflowRunParamsVxEntity >(workflowRunParamsVxEntity: V): WorkflowRunParamsEntity < V > {
        const result = new WorkflowRunParamsEntity < V >();
        result.params = workflowRunParamsVxEntity;
        return result;
    }

    static toJson < V extends WorkflowRunParamsVxEntity >(entity: WorkflowRunParamsEntity < V >) {
        if (entity === null) {
            return null
        }

        return {
            version: entity.version,
            params: entity.params.toJson(),
        }
    }

    static fromJson(json): WorkflowRunParamsEntity < WorkflowRunParamsVxEntity > {
        if (json === null) {
            return null;
        }

        try {
            const version = parseInt(json.version);
            let entity;

            switch (version) {
                case 1:
                default:
                    entity = new WorkflowRunParamsEntity < WorkflowRunParamsV1Entity >();
                    entity.params = new WorkflowRunParamsV1Entity();
                    break;
            }

            entity.params.loadJson(json.params);

            return entity;
        } catch (ex) {
            return null;
        }
    }

}

export interface WorkflowRunParamsVxEntity {

    toJson(): any;
    loadJson(json: any): void;

}

export class WorkflowRunParamsV1Entity implements WorkflowRunParamsVxEntity {

    address = '';
    balance = 0;

    static LIGHT_PARAMS_LIMIT_IN_USD = 1000;

    static newInstance(address: string, balance: number): WorkflowRunParamsV1Entity {
        const entity = new WorkflowRunParamsV1Entity();

        entity.address = address;
        entity.balance = balance;

        return entity;
    }

    asCreateWorkflowParams() {
        return {
            address: this.address,
            balance: this.balance,
        }
    }

    toJson() {
        return {
            address: this.address,
            balance: this.balance,
        }
    }

    loadJson(json: any) {
        this.address = json.address ?? this.address;
        this.balance = Number(json.balance ?? this.balance);
    }

    areLightParams() {
        return this.balance <= WorkflowRunParamsV1Entity.LIGHT_PARAMS_LIMIT_IN_USD;
    }

    areFullParams() {
        return this.areLightParams() === false;
    }

}
