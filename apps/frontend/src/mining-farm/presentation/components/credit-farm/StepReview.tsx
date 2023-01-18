import React, { useState } from 'react';
import { inject, observer } from 'mobx-react';

import S from '../../../../core/utilities/Main';
import AccountSessionStore from '../../../../../features/accounts/presentation/stores/AccountSessionStore';
import CreditMiningFarmDetailsPageStore from '../../stores/CreditMiningFarmDetailsPageStore';

import Actions, { ActionsHeight, ActionsLayout } from '../../../../core/presentation/components/Actions';
import Button, { ButtonPadding, ButtonType } from '../../../../core/presentation/components/Button';
import Checkbox from '../../../../core/presentation/components/Checkbox';
import Svg from '../../../../core/presentation/components/Svg';
import DataPreviewLayout, { createDataPreview } from '../../../../core/presentation/components/DataPreviewLayout';
import StyledContainer, { ContainerPadding, ContainerWidth } from '../../../../core/presentation/components/StyledContainer';
import ColumnLayout from '../../../../core/presentation/components/ColumnLayout';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import '../../styles/step-review.css';

type Props = {
    accountSessionStore?: AccountSessionStore;
    creditMiningFarmDetailsPageStore?: CreditMiningFarmDetailsPageStore;
    header: React.ReactNode;
}

function StepReview({ accountSessionStore, header, creditMiningFarmDetailsPageStore }: Props) {
    const [acceptedTerms, setAcceptedTerms] = useState(S.INT_FALSE);

    const miningFarmEntity = creditMiningFarmDetailsPageStore.miningFarmEntity;

    return (
        <StyledContainer className = { 'StepMiningFarmPreview FlexColumn' } containerWidth = { ContainerWidth.SMALL } >
            <ColumnLayout>
                { header }
                <StyledContainer containerPadding = { ContainerPadding.PADDING_24 }>
                    <div className={'B1 Bold MiningFarmName ColorNeutral100'}>{miningFarmEntity.name}</div>
                    <div className={'B3 Bold ColorNeutral060'}>{miningFarmEntity.description}</div>
                </StyledContainer>
                <DataPreviewLayout
                    dataPreviews = { [
                        createDataPreview('Account Email', accountSessionStore?.accountEntity?.email),
                        createDataPreview('Legal Entity Name', miningFarmEntity.legalName),
                        createDataPreview('Primary Account Owner', miningFarmEntity.primaryAccountOwnerName),
                        createDataPreview('Primary Account Owner Email', miningFarmEntity.primaryAccountOwnerEmail),
                        createDataPreview('BTC Address to receive awards', miningFarmEntity.rewardsFromPoolBtcAddress),
                        createDataPreview('BTC Address to receive awards leftovers', miningFarmEntity.leftoverRewardsBtcAddress),
                        createDataPreview('BTC Address to receive maintenance fees', miningFarmEntity.maintenanceFeePayoutBtcAddress),
                        createDataPreview('Manufacturers', creditMiningFarmDetailsPageStore.getSelectedManufacturersNames()),
                        createDataPreview('Miners', creditMiningFarmDetailsPageStore.getSelectedMinersNames()),
                        createDataPreview('Energy Source', creditMiningFarmDetailsPageStore.getSelectedEnergySourcesNames()),
                        createDataPreview('Machines Location', miningFarmEntity.machinesLocation),
                        createDataPreview('Hashrate', miningFarmEntity.formatHashPowerInTh()),
                        createDataPreview('Farm Maintenance Fees', miningFarmEntity.formatMaintenanceFeesInBtc()),
                        createDataPreview('Farm Photos', miningFarmEntity.farmPhotoUrls.length),

                    ] } />
                <div className={'TermsAgreeRow'}>
                    <Checkbox
                        label={'I agree to allow Aura Pool to store and process the personal information submitted above to provide me the service requested.'}
                        value={acceptedTerms}
                        onChange={setAcceptedTerms}
                    />
                </div>
                <Actions className={'ButtonRow'} layout={ActionsLayout.LAYOUT_ROW_ENDS} height={ActionsHeight.HEIGHT_48}>
                    <Button
                        onClick={creditMiningFarmDetailsPageStore.setStepFarmDetails}
                        type={ButtonType.TEXT_INLINE} >
                        <Svg svg={ArrowBackIcon} />
                    Back
                    </Button>
                    <Button
                        disabled={!acceptedTerms}
                        onClick={creditMiningFarmDetailsPageStore.finishCreation}
                        padding={ButtonPadding.PADDING_48} >
                    Finish
                    </Button>
                </Actions>
            </ColumnLayout>
        </StyledContainer>
    )
}

export default inject((stores) => stores)(observer(StepReview));