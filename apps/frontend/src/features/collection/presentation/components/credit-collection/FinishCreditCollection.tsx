import { inject, observer } from 'mobx-react';
import React from 'react';
import Actions, { ActionsLayout } from '../../../../../core/presentation/components/Actions';
import Button, { ButtonType } from '../../../../../core/presentation/components/Button';
import Svg from '../../../../../core/presentation/components/Svg';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import '../../styles/finish-credit-collection.css';
import StyledContainer, { ContainerBackground, ContainerPadding } from '../../../../../core/presentation/components/StyledContainer';
import DataPreviewLayout, { createDataPreview } from '../../../../../core/presentation/components/DataPreviewLayout';
import S from '../../../../../core/utilities/Main';

type Props = {
    hashingPower?: string
    addedNftCount?: number
    isOriginAddNfts: boolean
    onClickBack: () => void
    onClickSendForApproval: () => void
}

function FinishCreditCollection({ hashingPower, addedNftCount, isOriginAddNfts, onClickBack, onClickSendForApproval }: Props) {

    const dataPreviews = [];

    dataPreviews.push(createDataPreview('Hashing Power', hashingPower));
    dataPreviews.push(createDataPreview('Added NFTs', addedNftCount));

    return (
        <div className={'FinishCreditCollection FlexColumn '}>
            <div className={'H3 Bold'}>Finalise</div>
            <div className={'B1'}>Check all the iformation related to the collection.</div>
            {isOriginAddNfts === true && (
                <DataPreviewLayout dataPreviews={dataPreviews}/>
            )}
            <StyledContainer
                containerBackground={ContainerBackground.GRAY}
                className = { 'InstructionsBox' }
                containerShadow = { false }
                containerPadding = { ContainerPadding.PADDING_16 } >
                <ul>
                    {isOriginAddNfts === false
                        ? <>
                            <li>Review the collection and hash rate  information before sending it for approval to Aura Pool.</li>
                            <li>Once your collection is reviewed and approved you'll receive a notification on your email address.</li>
                            <li>Once Aura Pool verifies and approves this NFT will go on sale immediately.</li>
                        </>
                        : <>
                            <li>Once your NFTs are reviewed and approved you'll receive a notification on your email address. </li>
                            <li>Once Aura Pool verifies and approves this NFT will go on sale immediately. </li>
                        </>}
                </ul>
            </StyledContainer>
            <Actions layout={ActionsLayout.LAYOUT_ROW_ENDS} className={'ButtonsRow'}>
                <Button type={ButtonType.TEXT_INLINE} onClick={onClickBack}>
                    <Svg svg={ArrowBackIcon} />
                    Back
                </Button>
                <Button onClick={onClickSendForApproval}>
                    Send for Approval
                </Button>
            </Actions>
        </div>
    )
}

export default inject((stores) => stores)(observer(FinishCreditCollection));
