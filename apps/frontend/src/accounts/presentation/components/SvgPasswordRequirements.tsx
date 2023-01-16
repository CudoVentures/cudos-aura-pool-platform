import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';

import { InputValidation } from '../../../core/presentation/stores/ValidationState';
import Svg from '../../../core/presentation/components/Svg';

import WarningIcon from '@mui/icons-material/Warning';
import '../styles/svg-password-requirements.css';
import Popover from '../../../core/presentation/components/Popover';

type Props = {
    inputValidation: InputValidation;
}

function SvgPasswordRequirements({ inputValidation }: Props) {
    const [anchor, setAnchor] = useState(null);

    function onMouseEnter(e) {
        setAnchor(e.target);
    }

    function onMouseLeave() {
        setAnchor(null);
    }

    if (inputValidation.isError === false || inputValidation.showError === false) {
        return null;
    }

    return (
        <span onMouseEnter={onMouseEnter} className = { 'SvgPasswordRequirements' }>
            <Svg svg = { WarningIcon } />
            <Popover
                open={anchor !== null}
                anchorEl={anchor}
                onClose={onMouseLeave}>
                • At least 8 characters<br />
                • At least an uppercase letter<br />
                • At least a lowercase letter<br />
                • At least a number<br />
                • At least a special char
            </Popover>
        </span>
    )
}

export default observer(SvgPasswordRequirements);
