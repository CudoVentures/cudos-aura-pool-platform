import React from 'react';
import { inject, observer } from 'mobx-react'
import { useNavigate } from 'react-router-dom';

import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';

import Actions, { ActionsLayout } from '../../../../core/presentation/components/Actions';
import Button from '../../../../core/presentation/components/Button';
import Svg from '../../../../core/presentation/components/Svg';

import SvgGridNoContent from '../../../../public/assets/vectors/no-data-small.svg';
import AddIcon from '@mui/icons-material/Add';

import '../styles/no-collection-view.css';

type Props = {
    accountSessionStore?: AccountSessionStore;
}

function NoCollectionView({ accountSessionStore }: Props) {

    const navigate = useNavigate();

    function onClickCreateCollection() {
        navigate(AppRoutes.CREDIT_COLLECTION_DETAILS_CREATE);
    }

    return (
        <div className={'NoCollectionView FlexColumn'}>
            <Svg svg={SvgGridNoContent} />
            <div className={'H3 Bold'}>No Collections Yet</div>
            { accountSessionStore.isAdmin() === true && (
                <>
                    <div className={'B1 ColorNeutral060'}>Looks like you still don’t have collections</div>
                    {/* <Actions layout={ActionsLayout.LAYOUT_COLUMN_CENTER} >
                        <Button onClick={onClickCreateCollection}>
                            <Svg svg={AddIcon} />
                            Create First Collection
                        </Button>
                    </Actions> */}
                </>
            ) }
        </div>
    )
}

export default inject((stores) => stores)(observer(NoCollectionView));
