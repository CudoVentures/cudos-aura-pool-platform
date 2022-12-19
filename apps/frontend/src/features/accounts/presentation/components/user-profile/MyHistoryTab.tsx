import React from 'react';
import { inject, observer } from 'mobx-react';

import S from '../../../../../core/utilities/Main';
import UserProfilePageStore from '../../stores/UserProfilePageStore';
import { NftEventType } from '../../../../analytics/entities/NftEventEntity';

import { MenuItem } from '@mui/material';
import StyledContainer, { ContainerPadding } from '../../../../../core/presentation/components/StyledContainer';
import Select from '../../../../../core/presentation/components/Select';
import NftEventTable from '../../../../analytics/presentation/components/NftEventTable';

import '../../styles/my-history-tab.css';

type Props = {
    userProfilePageStore?: UserProfilePageStore
}

function MyHistoryTab({ userProfilePageStore }: Props) {

    return (
        <StyledContainer className={'MyHistoryTab FlexColumn'} containerPadding={ContainerPadding.PADDING_24}>
            <div className={'FlexRow TableHeader'}>
                <div className={'H3 Bold'}>Activity on Collections</div>
                <Select
                    className={'TableFilter'}
                    onChange={userProfilePageStore.onChangeTableFilter}
                    value={userProfilePageStore.nftEventFilterModel.eventType} >
                    <MenuItem value = { S.NOT_EXISTS }> All Event Types </MenuItem>
                    <MenuItem value = { NftEventType.TRANSFER }> Transfer </MenuItem>
                    <MenuItem value = { NftEventType.MINT }> Mint </MenuItem>
                </Select>
            </div>
            <NftEventTable
                tableState = { userProfilePageStore.historyTableState }
                nftEventEntities = { userProfilePageStore.nftEventEntities }
                getNftEntityById = { userProfilePageStore.getNftEntityById } />
        </StyledContainer>)
}

export default inject((stores) => stores)(observer(MyHistoryTab));
