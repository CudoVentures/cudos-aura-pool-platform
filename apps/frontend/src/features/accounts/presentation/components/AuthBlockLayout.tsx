import React from 'react';

import { SvgIconTypeMap } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import Actions, { ActionsHeight, ActionsLayout } from '../../../../core/presentation/components/Actions';
import StyledContainer, { ContainerWidth } from '../../../../core/presentation/components/StyledContainer';
import Svg, { SvgSize } from '../../../../core/presentation/components/Svg';

import '../styles/auth-block-layout.css';

type MuiSvgIcon = OverridableComponent < SvgIconTypeMap < {}, 'svg' > > & { muiName: string; };

type Props = {
    prefix?: React.ReactNode;
    title?: React.ReactNode | string;
    confirmationTitle?: React.ReactNode | string;
    confirmationTitleSvg?: string | MuiSvgIcon;
    subtitle: React.ReactNode | string;
    content?: React.ReactNode;
    subInputsAction?: React.ReactNode;
    actions?: React.ReactNode;
    suffix?: React.ReactNode;
}

export default function AuthBlockLayout({ prefix, title, confirmationTitle, confirmationTitleSvg, subtitle, content, subInputsAction, actions, suffix }: Props) {

    return (
        <StyledContainer className = { 'AuthBlockLayout' } containerWidth = { ContainerWidth.SMALL } >
            { prefix !== null && (
                <div className = { 'Prefix' } > { prefix } </div>
            ) }

            { title !== null && (
                <div className={'Title H2 Bold'}>{ title }</div>
            ) }
            { confirmationTitle !== null && (
                <div className={'Title H3 Bold FlexRow'}>
                    { confirmationTitleSvg !== null && (
                        <Svg className = { 'IconConfirmationTitle' } size = { SvgSize.CUSTOM } svg = { confirmationTitleSvg } />
                    ) }
                    { confirmationTitle }
                </div>
            ) }
            <div className={'Subtitle'}>{ subtitle }</div>

            { content !== null && (
                <div className = { 'ContentCnt' } >
                    { content }
                </div>
            ) }

            { subInputsAction !== null && (
                <div className = { 'SubInputsAction FlexColumn' } >{ subInputsAction }</div>
            ) }

            { actions !== null && (
                <Actions className = { 'BlockActions' } layout={ActionsLayout.LAYOUT_COLUMN_FULL} height={ActionsHeight.HEIGHT_48}>
                    { actions }
                </Actions>
            ) }

            { suffix !== null && (
                <div className = { 'Suffix' } > { suffix } </div>
            ) }
        </StyledContainer>
    )

}

AuthBlockLayout.defaultProps = {
    prefix: null,
    title: null,
    confirmationTitle: null,
    confirmationTitleSvg: null,
    content: null,
    subInputsAction: null,
    actions: null,
    suffix: null,
};
