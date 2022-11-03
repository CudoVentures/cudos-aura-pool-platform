import React from 'react';
import { observer } from 'mobx-react-lite';
import { inject } from 'mobx-react';

import CreditCollectionStore from '../../stores/CreditCollectionStore';

import NavRow, { createNavStep, NavStep } from '../../../../../core/presentation/components/NavRow';

import '../../styles/credit-collection-nav-row.css';

type Props = {
    className?: string;
    creditCollectionStore?: CreditCollectionStore;
}

function CreditCollectionNavRow({ className, creditCollectionStore }: Props) {

    function getNavSteps(): NavStep[] {
        if (creditCollectionStore.isCreateMode() === true) {
            return [
                createNavStep(1, 'Collection Details', creditCollectionStore.isStepDetails(), creditCollectionStore.isStepAddNfts() || creditCollectionStore.isStepFinish()),
                createNavStep(2, 'Add NFTs', creditCollectionStore.isStepAddNfts(), creditCollectionStore.isStepFinish()),
                createNavStep(3, 'Finish', creditCollectionStore.isStepFinish(), false),
            ]
        }

        if (creditCollectionStore.isAddNftsMode() === true) {
            return [
                createNavStep(1, 'Add NFTs', creditCollectionStore.isStepAddNfts(), creditCollectionStore.isStepFinish()),
                createNavStep(2, 'Finish', creditCollectionStore.isStepFinish(), false),
            ]
        }

        return [];
    }

    if (creditCollectionStore.isEditMode() === true) {
        return null;
    }

    return (
        <NavRow className={`CreditCollectionNavRow ${className}`} navSteps={getNavSteps()} />
    )

}

CreditCollectionNavRow.defaultProps = {
    className: '',
}

export default inject((stores) => stores)(observer(CreditCollectionNavRow));
