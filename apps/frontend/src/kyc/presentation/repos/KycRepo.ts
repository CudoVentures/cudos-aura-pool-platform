import KycEntity from '../../entities/KycEntity';

export default interface KycRepo {

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void);
    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener : null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void);

    fetchKyc(): Promise < { kycEntity: KycEntity, purchasesInUsdSoFar: number } >;
    creditKyc(kycEntity: KycEntity): Promise < string >;
    createWorkflowRun(kycEntity: KycEntity, runFullWorkflow: number): Promise < void >;

}
