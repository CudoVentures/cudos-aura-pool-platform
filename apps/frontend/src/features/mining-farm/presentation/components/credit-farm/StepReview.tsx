import React, { useState } from 'react';

import '../../styles/step-review.css';
import Actions, { ActionsHeight, ActionsLayout } from '../../../../../core/presentation/components/Actions';
import Button, { ButtonPadding, ButtonType } from '../../../../../core/presentation/components/Button';
import { inject, observer } from 'mobx-react';
import Checkbox from '../../../../../core/presentation/components/Checkbox';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Svg from '../../../../../core/presentation/components/Svg';
import AccountSessionStore from '../../../../../features/accounts/presentation/stores/AccountSessionStore';
import CreditMiningFarmDetailsPageStore from '../../stores/CreditMiningFarmDetailsPageStore';
import DataPreviewLayout, { createDataPreview } from '../../../../../core/presentation/components/DataPreviewLayout';

type Props = {
    accountSessionStore?: AccountSessionStore;
    creditMiningFarmDetailsPageStore?: CreditMiningFarmDetailsPageStore;
}

function StepReview({ accountSessionStore, creditMiningFarmDetailsPageStore }: Props) {
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const miningFarmEntity = creditMiningFarmDetailsPageStore.miningFarmEntity;
    const imageEntities = creditMiningFarmDetailsPageStore.imageEntities;

    return (
        <div className = { 'StepMiningFarmPreview FlexColumn' }>
            <div className={'H3 Bold FullLine'}>{miningFarmEntity.name}</div>
            <div className={'B3 FullLine Descripton'}>{miningFarmEntity.description}</div>
            <DataPreviewLayout
                dataPreviews = { [
                    createDataPreview('Account Email', accountSessionStore.accountEntity.email),
                    createDataPreview('Legal Entity Name', miningFarmEntity.legalName),
                    createDataPreview('Primary Account Owner', miningFarmEntity.primaryAccountOwnerName),
                    createDataPreview('Primary Account Owner Email', miningFarmEntity.primaryAccountOwnerEmail),
                    createDataPreview('Manufacturers', creditMiningFarmDetailsPageStore.getSelectedManufacturersNames()),
                    createDataPreview('Miners', creditMiningFarmDetailsPageStore.getSelectedMinersNames()),
                    createDataPreview('Energy Source', creditMiningFarmDetailsPageStore.getSelectedEnergySourcesNames()),
                    createDataPreview('Machines Location', miningFarmEntity.machinesLocation),
                    createDataPreview('Hashrate', miningFarmEntity.displayHashRate()),
                    createDataPreview('Farm Photos', imageEntities.length),

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
                    type={ButtonType.TEXT_INLINE}
                >
                    <Svg svg={ArrowBackIcon} />
                    Back
                </Button>
                <Button
                    disabled={!acceptedTerms}
                    onClick={creditMiningFarmDetailsPageStore.finishCreation}
                    padding={ButtonPadding.PADDING_48}
                >Finish</Button>
            </Actions>
        </div>
    )
}

export default inject((stores) => stores)(observer(StepReview));
