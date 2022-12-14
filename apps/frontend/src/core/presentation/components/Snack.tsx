import React from 'react';
import { inject, observer } from 'mobx-react';

import SnackStore, { SnackType } from '../stores/SnackStore'

import { Alert, AlertColor, Snackbar } from '@mui/material';
import Svg, { SvgSize } from './Svg';

import CheckIcon from '@mui/icons-material/Check';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import '../styles/snack.css';

type Props = {
    snackStore: SnackStore;
}

function Snack({ snackStore }: Props) {
    function getSeverity(): AlertColor {
        switch (snackStore.type) {
            case SnackType.ERROR:
                return 'error';
            case SnackType.SUCCESS:
            default:
                return 'success';
        }
    }

    return (
        <Snackbar
            open = { snackStore.visible }
            autoHideDuration = { 3000 }
            onClose = { snackStore.hide }
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} >
            <Alert
                onClose = { snackStore.hide }
                classes = { {
                    root: 'SnackAlert',
                } }
                severity = { getSeverity() }
                iconMapping = { {
                    'success': (
                        <Svg svg = { CheckIcon } className = { 'SnackSvg SnackSvgSuccess'} size = { SvgSize.CUSTOM } />
                    ),
                    'error': (
                        <Svg svg = { ErrorOutlineIcon } className = { 'SnackSvg SnackSvgError' } size = { SvgSize.CUSTOM } />
                    ),
                } } >
                { snackStore.msg }
            </Alert>
        </Snackbar>
    )
}

export default inject((stores) => stores)(observer(Snack));
