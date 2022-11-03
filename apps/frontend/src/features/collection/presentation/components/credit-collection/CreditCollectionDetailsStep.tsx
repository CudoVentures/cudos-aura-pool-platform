import { inject, observer } from 'mobx-react';
import React from 'react';

import CreditCollectionStore from '../../stores/CreditCollectionStore';

import CreditCollectionSidePreview, { CreditCollectionSidePreviewSize } from './CreditCollectionSidePreview';
import CreditCollectionDetailsForm from './CreditCollectionDetailsForm';
import CreditCollectionNavRow from './CreditCollectionNavRow';

import '../../styles/credit-collection-details-step.css';

type Props = {
    creditCollectionStore?: CreditCollectionStore,
}

function CreditCollectionDetailsStep({ creditCollectionStore }: Props) {

    return (
        <div className={'CreditCollectionDetailsStep Grid'}>
            <div className={'FormContainer FlexColumn'}>
                <CreditCollectionNavRow className = { 'FormNav' } />
                <CreditCollectionDetailsForm />
            </div>
            <CreditCollectionSidePreview size={CreditCollectionSidePreviewSize.SMALL}/>
        </div>
    )

}

export default inject((stores) => stores)(observer(CreditCollectionDetailsStep));
