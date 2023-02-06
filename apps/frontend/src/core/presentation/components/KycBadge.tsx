import { observer, inject } from 'mobx-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import { KycStatus } from '../../../kyc/entities/KycEntity';
import KycStore from '../../../kyc/presentation/stores/KycStore';
import Svg, { SvgSize } from './Svg';

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import '../styles/kyc-badge.css';

type Props = {
    kycStore?: KycStore;
}

function KycBadge({ kycStore }: Props) {
    const navigate = useNavigate();

    const kyeEntity = kycStore.kycEntity;

    function onClickKyc() {
        navigate(AppRoutes.KYC);
    }

    function getKycStatusCssClass() {
        switch (kyeEntity?.getKycStatus()) {
            case KycStatus.IN_PROGRESS:
                return 'KycBadgeVerificationInProgress';
            case KycStatus.COMPLETED_FAILED:
                return 'KycBadgeVerificationFailed';
            case KycStatus.COMPLETED_SUCCESS:
                return 'KycBadgeVerificationSucess';
            case KycStatus.NOT_STARTED:
            default:
                return 'KycBadgeNotVerified';
        }
    }

    function shouldDisplayKycStatusIcon() {
        switch (kyeEntity?.getKycStatus()) {
            case KycStatus.IN_PROGRESS:
                return false;
            case KycStatus.COMPLETED_FAILED:
                return true;
            case KycStatus.COMPLETED_SUCCESS:
                return false;
            case KycStatus.NOT_STARTED:
            default:
                return true;
        }
    }

    return (
        <div className = { `KycBadge Bold ${getKycStatusCssClass()}` } onClick = { onClickKyc } >
            { kycStore.getStatusName() }
            { shouldDisplayKycStatusIcon() === true && (
                <Svg svg = { ErrorOutlineIcon } className = { 'SvgIcon' } size = { SvgSize.CUSTOM } />
            ) }
        </div>
    )

}

export default inject((stores) => stores)(observer(KycBadge));
