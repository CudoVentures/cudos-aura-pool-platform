import React, { HTMLAttributes } from 'react';
import { SvgIconTypeMap } from '@mui/material/SvgIcon';
import { OverridableComponent } from '@mui/material/OverridableComponent';

import '../styles/svg.css';

export enum SvgSize {
    DEFAULT,
    CUSTOM
}

type MuiSvgIcon = OverridableComponent < SvgIconTypeMap < {}, 'svg' > > & { muiName: string; };

type Props = HTMLAttributes < HTMLDivElement > & {
    className?: string;
    svg: string | MuiSvgIcon,
    size?: SvgSize,
}

const Svg = React.forwardRef(({ className, size, svg, ...props }: Props, ref) => {

    const cssSize = size === SvgSize.DEFAULT ? '' : 'Size';

    if (typeof (svg) === 'string') {
        return (
            <div
                { ...props }
                ref = { ref }
                className = { `SVG ${cssSize} ${className}` }
                dangerouslySetInnerHTML = {{ __html: svg as string }} />
        )
    }

    return (
        <div
            { ...props }
            ref = { ref }
            className = { `SVG ${cssSize} ${className}` }>
            { React.createElement(svg) }
        </div>
    )

});

Svg.displayName = 'Svg';

Svg.defaultProps = {
    className: '',
    size: SvgSize.DEFAULT,
}

export default Svg;
