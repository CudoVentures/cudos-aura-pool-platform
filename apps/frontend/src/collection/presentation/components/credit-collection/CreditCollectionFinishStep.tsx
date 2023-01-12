import React from 'react';
import { inject, observer } from 'mobx-react';

import CreditCollectionStore from '../../stores/CreditCollectionStore';
import CreditCollectionSidePreview from './CreditCollectionSidePreview';
import CreditCollectionNavRow from './CreditCollectionNavRow';
import CreditCollectionFinish from './CreditCollectionFinish';

import '../../styles/credit-collection-finish-step.css';

type Props = {
    creditCollectionStore?: CreditCollectionStore;
}

function CreditCollectionFinishStep({ creditCollectionStore }: Props) {

    return (
        <div className={`CreditCollectionFinishStep FormAndPreviewContainer ${creditCollectionStore.isCreateMode() === true ? 'Grid' : 'AddNftMode FlexColumn'} `}>
            <div className={'FormContainer FlexColumn'}>
                <CreditCollectionNavRow className = { 'FormNav' } />
                <CreditCollectionFinish />
            </div>
            {creditCollectionStore.isCreateMode() === true && (
                <CreditCollectionSidePreview />
            )}
        </div>
    )

}

export default inject((stores) => stores)(observer(CreditCollectionFinishStep));
