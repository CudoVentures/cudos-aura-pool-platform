import React from 'react';

import '../styles/border-shadow-padding-container.css';

export enum ContainerWidth {
    SMALL = 'WidthSmall',
    MEDIUM = 'WidthMedium',
    LARGE = 'WidthLarge',
}

export enum ContainerBackground {
    WHITE = 'BgWhite',
    GRAY = 'BgGray',
}

export enum ContainerPadding {
    PADDING_48 = 'Padding48',
    PADDING_24 = 'Padding24',
    PADDING_16 = 'Padding16',
}

type Props = {
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
    containerPadding: ContainerPadding.PADDING_48,
    containerShadow: false,
}
