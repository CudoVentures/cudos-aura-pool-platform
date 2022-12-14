import React from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';

import AccountSessionStore from '../../../../accounts/presentation/stores/AccountSessionStore';
import AppRoutes from '../../../../app-routes/entities/AppRoutes';

import Actions, { ActionsHeight, ActionsLayout } from '../../../../../core/presentation/components/Actions';
import Button from '../../../../../core/presentation/components/Button';
import Svg from '../../../../../core/presentation/components/Svg';
import StyledContainer, { ContainerWidth } from '../../../../../core/presentation/components/StyledContainer';
import ColumnLayout from '../../../../../core/presentation/components/ColumnLayout';

import CheckIcon from '@mui/icons-material/Check';
import SvgNoDataLarge from '../../../../../public/assets/vectors/no-data-large.svg';
import '../../styles/step-success.css';

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
        <StyledContainer className = { 'StepMiningFarmSuccess' } containerWidth = { ContainerWidth.SMALL } >
            <ColumnLayout gap = { 40 } >
                <Svg className = { 'SvgNoFarm' } svg = { SvgNoDataLarge } />

                <div>
                    <div className={'HeadingRow FlexRow'}>
                        <Svg svg={CheckIcon} className={ 'SuccessCheck' }/>
                        <div className={'H3 Bold'}>Great! Your Farm Profile is sent for review.</div>
                    </div>
                    <div className={'B1 SubTitle'}>Your farm will be reviewed by Aura Pool and you will receive an email with the results.<br />You can explore the Marketplace while waiting.</div>
                </div>

                <Actions className={'ButtonRow'} layout={ActionsLayout.LAYOUT_COLUMN_FULL} height={ActionsHeight.HEIGHT_48}>
                    <Button onClick={onClickGoHome}>Go to Home</Button>
                </Actions>
            </ColumnLayout>
        </StyledContainer>
    )
}

export default inject((stores) => stores)(observer(StepReview));
