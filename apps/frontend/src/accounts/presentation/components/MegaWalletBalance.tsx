import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';

import MegaWalletBalanceStore from '../stores/MegaWalletBalanceStore';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';

import '../styles/mega-wallet-balance.css';

type Props = {
    className?: string;
    cudosStore?: CudosStore;
    megaWalletBalanceStore?: MegaWalletBalanceStore;
}

function MegaWalletBalance({ className, cudosStore, megaWalletBalanceStore }: Props) {
    useEffect(() => {
        cudosStore.init();
        megaWalletBalanceStore.fetchWalletBalance();
    }, []);

    return (
        <div className = { `MegaWalletBalance ${className}` } >
            <div className={'AmountInCudos'}>
                <div className={'H2 ExtraBold'}>{megaWalletBalanceStore.formatSuperAdminBalance()}</div>
                <div className={'H3 SemiBold ColorNeutral060'}>CUDOS</div>
            </div>
            <div className={'H3 SemiBold AmountDollars'}>{cudosStore.formatAcudosInUsd(megaWalletBalanceStore.getSuperAdminBalanceInAcudos())}</div>
        </div>
    )
}

MegaWalletBalance.defaultProps = {
    className: '',
};

export default inject((stores) => stores)(observer(MegaWalletBalance));
