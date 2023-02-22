import AllowlistUserEntity from '../../entities/AllowlistUserEntity';

export default interface AllowlistRepo {
    setPresentationActionsCallbacks(enableActions: () => void, disableActions: () => void);
    setPresentationAlertCallbacks(showAlert: (msg: string, positiveListener : null | (() => boolean | void), negativeListener: null | (() => boolean | void)) => void);

    fetchAllowlistUserBySessionAccount(): Promise < AllowlistUserEntity >;
    fetchTotalListedUsers(): Promise < number >;
}
