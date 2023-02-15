import { observer, inject } from 'mobx-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import KycEntity, { KycStatusWithPartial } from '../../../kyc/entities/KycEntity';
import KycStore from '../../../kyc/presentation/stores/KycStore';
import Svg, { SvgSize } from './Svg';

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import '../styles/kyc-badge.css';

type Props = {
    kycStore?: KycStore;
}

function KycBadge({ kycStore }: Props) {
    const navigate = useNavigate();

    const kycStatus = kycStore.getBadgeStatus();

    function onClickKyc() {
        navigate(AppRoutes.KYC);
    }

    function getKycStatusCssClass() {
        switch (kycStatus) {
            case KycStatusWithPartial.IN_PROGRESS:
                return 'KycBadgeVerificationInProgress';
            case KycStatusWithPartial.COMPLETED_FAILED:
                return 'KycBadgeVerificationFailed';
            case KycStatusWithPartial.COMPLETED_SUCCESS:
            case KycStatusWithPartial.PARTIAL:
                return 'KycBadgeVerificationSucess';
            case KycStatusWithPartial.NOT_STARTED:
            default:
                return 'KycBadgeNotVerified';
        }
    }

    function shouldDisplayKycStatusIcon() {
        switch (kycStatus) {
            case KycStatusWithPartial.IN_PROGRESS:
                return false;
            case KycStatusWithPartial.COMPLETED_FAILED:
                return true;
            case KycStatusWithPartial.COMPLETED_SUCCESS:
            case KycStatusWithPartial.PARTIAL:
                return false;
            case KycStatusWithPartial.NOT_STARTED:
            default:
                return true;
        }
    }

    return (
        <div className = { `KycBadge Bold ${getKycStatusCssClass()}` } onClick = { onClickKyc } >
            { KycEntity.getStatusName(kycStatus) }
            { shouldDisplayKycStatusIcon() === true && (
                <Svg svg = { ErrorOutlineIcon } className = { 'SvgIcon' } size = { SvgSize.CUSTOM } />
            ) }
        </div>
    )

}

export default inject((stores) => stores)(observer(KycBadge));
