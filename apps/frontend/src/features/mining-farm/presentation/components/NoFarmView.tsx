import React from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';

import AppRoutes from '../../../app-routes/entities/AppRoutes';
import AccountSessionStore from '../../../accounts/presentation/stores/AccountSessionStore';

import Actions from '../../../../core/presentation/components/Actions';
import Button from '../../../../core/presentation/components/Button';
import Svg from '../../../../core/presentation/components/Svg';

import SvgNoDataSmall from '../../../../public/assets/vectors/no-data-small.svg';
import AddIcon from '@mui/icons-material/Add';
import '../styles/no-farm-view.css';

type Props = {
    accountSessionStore?: AccountSessionStore;
}

function NoFarmView({ accountSessionStore }: Props) {

    const navigate = useNavigate();

    function onClickEditProfile() {
        navigate(AppRoutes.CREDIT_MINING_FARM_DETAILS);
    }

    return (
        <div className = { 'NoFarmView FlexSingleCenter' } >
            <div className = { 'NoFarmLayout FlexColumn' } >
                <Svg className = { 'SvgNoFarm' } svg = { SvgNoDataSmall } />
                <div className = { 'Title H3 Bold' } >No Farm Profile</div>
                { accountSessionStore.isAdmin() === true && (
                    <>
                        <div className = { 'Subtitle' } > Looks like you haven’t registered your farm yet. </div>
                        <Actions>
                            <Button onClick = { onClickEditProfile } >
                                <Svg svg = { AddIcon } />
                                Register Farm
                            </Button>
                        </Actions>
                    </>
                ) }
            </div>
        </div>
    )
}

export default inject((stores) => stores)(observer(NoFarmView));
