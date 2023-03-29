import React from 'react';
import { inject, observer } from 'mobx-react';

import UserProfilePageStore from '../../stores/UserProfilePageStore';

import StyledContainer, { ContainerPadding } from '../../../../core/presentation/components/StyledContainer';

import '../../styles/my-purchases-tab.css';
import Table, { createTableCell, createTableCellString, createTableRow } from '../../../../core/presentation/components/Table';
import { ALIGN_CENTER, ALIGN_LEFT } from '../../../../core/presentation/components/TableDesktop';
import PurchaseTransactionEntity from '../../../../nft/entities/PurchaseTransactionEntity';
import { CHAIN_DETAILS } from '../../../../core/utilities/Constants';
import Svg from '../../../../core/presentation/components/Svg';
import Button, { ButtonColor, ButtonPadding, ButtonType } from '../../../../core/presentation/components/Button';
import CheckForPresaleRefundsModalStore from '../../stores/CheckForPresaleRefundsModalStore';
import Actions, { ActionsHeight } from '../../../../core/presentation/components/Actions';

type Props = {
    userProfilePageStore?: UserProfilePageStore
    checkForPresaleRefundsModalStore?: CheckForPresaleRefundsModalStore;
}

function MyPurchasesTab({ userProfilePageStore, checkForPresaleRefundsModalStore }: Props) {
    function getLegend() {
        return ['txHash', 'Time', 'Status'];
    }

    function getWidths() {
        return ['50%', '30%', '20%'];
    }

    function getAligns() {
        return [ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT];
    }

    function renderCollectionsRows() {
        return userProfilePageStore.purchaseTransactionEntities.map((purchaseTransactionEntity: PurchaseTransactionEntity) => {
            const tableCells = [
                createTableCell((
                    <a className={'Bold Dots TxHashCell'} href= {CHAIN_DETAILS.EXPLORER_URL + purchaseTransactionEntity.txhash }>{purchaseTransactionEntity.txhash}</a>
                )),
                createTableCellString(purchaseTransactionEntity.getTimeFormatted()),
                createTableCell(
                    <div className={`PurchaseStatusCell FlexRow ${purchaseTransactionEntity.getStatusString()}`}>
                        {purchaseTransactionEntity.isStatusRefunded() === true && purchaseTransactionEntity.isEthTransaction() === true
                            ? <div
                                className={'PurchaseStatusCell FlexRow'}
                                onClick={() => checkForPresaleRefundsModalStore.showSignal()}
                            >
                                <Svg svg={purchaseTransactionEntity.getStatusSvg()} />
                                Check for refunds
                            </div>
                            : <>
                                <Svg svg={purchaseTransactionEntity.getStatusSvg()} />
                                {purchaseTransactionEntity.getStatusString()}
                            </>
                        }
                    </div>,
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
