import React from 'react';

import '../styles/styled-container.css';

export enum ContainerWidth {
    SMALL = 'WidthSmall',
    MEDIUM = 'WidthMedium',
    LARGE = 'WidthLarge',
}

export enum ContainerBackground {
    WHITE = 'BgWhite',
    GRAY = 'BgGray',
    NEUTRAL_100 = 'BgNeutral100',
}

export enum ContainerPadding {
    PADDING_40 = 'Padding40',
    PADDING_24 = 'Padding24',
    PADDING_16 = 'Padding16',
}

export enum ContainerBorder {
    NEUTRAL_20 = 'BorderNeutral20',
    PRIMARY_60 = 'BorderPrimary60',
    GRADIENT = 'gradientBorder'
}

export type Props = {
    className?: string;
    onClick?: () => void;
    containerWidth?: ContainerWidth,
    containerBackground?: ContainerBackground,
    containerPadding?: ContainerPadding,
    containerBorder?: ContainerBorder,
    containerShadow?: boolean,
}

export default function StyledContainer({ className, onClick, containerWidth, containerBackground, containerPadding, containerShadow, containerBorder, children }: React.PropsWithChildren < Props >) {

    function cssContainerShadow() {
        return containerShadow === true ? 'Shadow' : '';
    }

    return (
        <div className={`StyledContainer ${containerWidth} ${containerBackground} ${containerPadding} ${containerBorder} ${cssContainerShadow()} ${className}`} onClick = { onClick }>
            {children}
        </div>
    )
}

StyledContainer.defaultProps = {
    className: '',
    onClick: undefined,
    containerWidth: ContainerWidth.LARGE,
    containerBackground: ContainerBackground.WHITE,
    containerPadding: ContainerPadding.PADDING_40,
    containerBorder: ContainerBorder.NEUTRAL_20,
    containerShadow: true,
}
