import React from 'react';
import { inject, observer } from 'mobx-react';

import UserProfilePageStore from '../../stores/UserProfilePageStore';

import StyledContainer, { ContainerPadding } from '../../../../core/presentation/components/StyledContainer';

import '../../styles/my-purchases-tab.css';
import Table, { createTableCell, createTableCellString, createTableRow } from '../../../../core/presentation/components/Table';
import { ALIGN_CENTER, ALIGN_LEFT } from '../../../../core/presentation/components/TableDesktop';
import PurchaseTransactionEntity from '../../../../nft/entities/PurchaseTransactionEntity';
import { CHAIN_DETAILS } from '../../../../core/utilities/Constants';

type Props = {
    userProfilePageStore?: UserProfilePageStore
}

function MyPurchasesTab({ userProfilePageStore }: Props) {
    function getLegend() {
        return ['txHash', 'Time', 'Status'];
    }

    function getWidths() {
        return ['50%', '35%', '15%'];
    }

    function getAligns() {
        return [ALIGN_LEFT, ALIGN_LEFT, ALIGN_CENTER];
    }

    function renderCollectionsRows() {
        return userProfilePageStore.purchaseTransactionEntities.map((purchaseTransactionEntity: PurchaseTransactionEntity) => {
            const tableCells = [
                createTableCell((
                    <a className={'Bold Dots TxHashCell'} href= {CHAIN_DETAILS.EXPLORER_URL + purchaseTransactionEntity.txhash }>{purchaseTransactionEntity.txhash}</a>
                )),
                createTableCellString(purchaseTransactionEntity.getTimeFormatted()),
                createTableCell(
                    <div className={`PurchaseStatusCell ${purchaseTransactionEntity.getStatusString()}`}>{purchaseTransactionEntity.getStatusString()}</div>,
                ),
            ]

            return createTableRow(
                tableCells,
            );
        });
    }

    return (
        <StyledContainer className={'MyPurchasesTab FlexColumn'} containerPadding={ContainerPadding.PADDING_24}>
            <div className={'FlexRow TableHeader'}>
                <div className={'H3 Bold'}>Purchases</div>
            </div>
            {userProfilePageStore.purchaseTransactionEntities !== null && (<Table
                className={'PurchaseTransactionsTable'}
                legend={getLegend()}
                widths={getWidths()}
                aligns={getAligns()}
                tableState={userProfilePageStore.purchasesTableState}
                rows={renderCollectionsRows()} />)}
            {userProfilePageStore.purchaseTransactionEntities === null && (<div className={'Loading'} />)}
        </StyledContainer>)
}

export default inject((stores) => stores)(observer(MyPurchasesTab));
