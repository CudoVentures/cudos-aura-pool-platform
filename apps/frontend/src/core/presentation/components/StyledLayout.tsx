import React from 'react';

import S from '../../utilities/Main';

import Actions, { ActionsHeight, ActionsLayout } from './Actions';
import StyledContainer, { ContainerPadding } from './StyledContainer';

import '../styles/styled-layout.css';

type Props = {
    className?: string;
    title?: string;
    smallTitle?: boolean;
    headerRight?: React.ReactNode;
    bottomCenterButtons?: React.ReactNode;
    bottomRightButtons?: React.ReactNode;
    hasBottomDivider?: boolean;
}

export default function StyledLayout({ className, title, smallTitle, headerRight, bottomCenterButtons, bottomRightButtons, hasBottomDivider, children }: React.PropsWithChildren < Props >) {
    return (
        <StyledContainer className = { `StyledLayout FlexColumn ${className}` } containerPadding = { ContainerPadding.PADDING_24 } >
            { (title !== null || headerRight !== null) && (
                <div className = { 'StyledLayoutHeader FlexRow FlexSplit' } >
                    { title !== null && (
                        <div className = { `StyleLayoutTitle ExtraBold H1 ${S.CSS.getClassName(smallTitle, 'StyleLayoutTitleSmall')}` } >{ title }</div>
                    ) }
                    { headerRight !== null && (
                        <div className = { 'StartRight FlexRow' } >
                            { headerRight }
                        </div>
                    ) }
                </div>
            )}
            <div className = { 'StylesLayoutContent' } >
                { children }
            </div>
            <div className = { `StyledLayoutBottom ${S.CSS.getClassName(hasBottomDivider, 'WithDivider')}` } >
                { bottomCenterButtons !== null && (
                    <Actions height = { ActionsHeight.HEIGHT_32 } layout = { ActionsLayout.LAYOUT_COLUMN_CENTER } >
                        { bottomCenterButtons }
                    </Actions>
                ) }
                { bottomRightButtons !== null && (
                    <Actions height = { ActionsHeight.HEIGHT_32 } layout = { ActionsLayout.LAYOUT_ROW_RIGHT } >
                        { bottomRightButtons }
                    </Actions>
                ) }
            </div>
        </StyledContainer>
    )
}

StyledLayout.defaultProps = {
    className: '',
    title: null,
    smallTitle: true,
    headerRight: null,
    bottomCenterButtons: null,
    bottomRightButtons: null,
    hasBottomDivider: false,
}
