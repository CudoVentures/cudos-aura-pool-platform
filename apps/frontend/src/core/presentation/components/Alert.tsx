// version 3.0.0
import React from 'react';
import { inject, observer } from 'mobx-react';

import AlertStore from '../stores/AlertStore';
import AnimationContainer from './AnimationContainer';

import '../styles/alert.css';

type Props = {
    alertStore?: AlertStore;
}

function Alert({ alertStore }: Props) {

    function onClickPositive() {
        let handled: boolean | void = false;
        if (alertStore.positiveListener !== null) {
            handled = alertStore.positiveListener();
        }

        if (handled !== true) {
            alertStore.hide();
        }
    }

    function onClickNegative() {
        let handled: boolean | void = false;
        if (alertStore.negativeListener !== null) {
            handled = alertStore.negativeListener();
        }

        if (handled !== true) {
            alertStore.hide();
        }
    }

    function onClickNeutral() {
        let handled: boolean | void = false;
        if (alertStore.neutralListener !== null) {
            handled = alertStore.neutralListener();
        }

        if (handled !== true) {
            alertStore.hide();
        }
    }

    return (
        <AnimationContainer className = { 'AlertWrapper' } active = { alertStore.isVisible() } >
            <div className = { 'Alert' } >
                <div className = { 'Msg ScrollView' } >{alertStore.msg}</div>

                <div className = { 'FlexSplit' } >
                    { alertStore.neutralLabel !== null && (
                        <div
                            className = { 'TextButton Neutral' }
                            onClick = { onClickNeutral } >
                            { alertStore.neutralLabel }
                        </div>
                    ) }

                    <div className = { 'StartRight' } >
                        { alertStore.negativeLabel !== null && (
                            <div
                                className = { 'TextButton Negative' }
                                onClick = { onClickNegative } >
                                { alertStore.negativeLabel }
                            </div>
                        ) }

                        { alertStore.positiveLabel !== null && (
                            <div
                                className = { 'TextButton Positive' }
                                onClick = { onClickPositive } >
                                { alertStore.positiveLabel }
                            </div>
                        ) }

                    </div>
                </div>
            </div>
        </AnimationContainer>
    )

}

export default inject('alertStore')(observer(Alert));
