import React from 'react';
import { inject, observer } from 'mobx-react';

import AccountSessionStore from '../../../../accounts/presentation/stores/AccountSessionStore';

import Actions, { ActionsHeight, ActionsLayout } from '../../../../../core/presentation/components/Actions';
import Button from '../../../../../core/presentation/components/Button';
import Svg from '../../../../../core/presentation/components/Svg';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import '../../styles/step-success.css';
import { useNavigate } from 'react-router-dom';
import AppRoutes from '../../../../app-routes/entities/AppRoutes';

type Props = {
    accountSessionStore?: AccountSessionStore
}

function StepReview({ accountSessionStore }: Props) {
    const navigate = useNavigate();

    async function onClickGoHome() {
        await accountSessionStore.loadAdminMiningFarmApproval();
        navigate(AppRoutes.HOME);
    }

    return (
        <div className = { 'StepMiningFarmSuccess FlexColumn' }>
            <div className={'HeadingRow FullLine FlexRow'}>
                <Svg svg={CheckCircleIcon}/>
                <div className={'H3 Bold'}>Thanks for your request!</div>
            </div>
            <div className={'B1 FullLine'}>Your request will be reviewed by Aura Pool and you will receive an email with your unique credentials to access the Admin portal.</div>

            {/* <div className={'EmailBox FlexRow'}>
                {accountSessionStore.accountEntity.email}
                <Svg svg={AlternateEmailIcon} />
            </div> */}
            <Actions className={'ButtonRow'} layout={ActionsLayout.LAYOUT_COLUMN_FULL} height={ActionsHeight.HEIGHT_48}>
                <Button onClick={onClickGoHome}>Go to Home</Button>
            </Actions>
        </div>
    )
}

export default inject((stores) => stores)(observer(StepReview));
