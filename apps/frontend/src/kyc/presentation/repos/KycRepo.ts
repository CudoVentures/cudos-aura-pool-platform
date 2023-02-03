import KycEntity from '../../entities/KycEntity';

export default interface KycRepo {

    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void);
    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener : null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void);

    fetchKyc(): Promise < KycEntity >;
    creditKyc(kycEntity: KycEntity): Promise < string >;
    creditCheck(kycEntity: KycEntity): Promise < void >;

}
