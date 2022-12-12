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

export type Props = {
    className?: string;
    containerWidth?: ContainerWidth,
    containerBackground?: ContainerBackground,
    containerPadding?: ContainerPadding,
    containerShadow?: boolean,
}

export default function StyledContainer({ className, containerWidth, containerBackground, containerPadding, containerShadow, children }: React.PropsWithChildren < Props >) {

    function cssContainerShadow() {
        return containerShadow === true ? 'Shadow' : '';
    }

    return (
        <div className={`StyledContainer ${containerWidth} ${containerBackground} ${containerPadding} ${cssContainerShadow()} ${className}`}>
            {children}
        </div>
    )
}

StyledContainer.defaultProps = {
    className: '',
    containerWidth: ContainerWidth.LARGE,
    containerBackground: ContainerBackground.WHITE,
    containerPadding: ContainerPadding.PADDING_40,
    containerShadow: true,
}
