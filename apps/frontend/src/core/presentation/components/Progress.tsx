import { observer, inject } from 'mobx-react';
import React from 'react';
import ProgressStore from '../stores/ProgressStore';

import AnimationContainer from './AnimationContainer';
import LoadingIndicator from './LoadingIndicator';

import '../styles/progress.css';

type Props = {
    progressStore?: ProgressStore;
}

function Progress({ progressStore }: Props) {

    return (
        <AnimationContainer className = { 'ProgressWrapper' } active = { progressStore.isVisible() } >
            <div className = { 'Progress' } >
                { progressStore.title !== '' && (
                    <div className = { 'ProgressTitle' } > { progressStore.title } </div>
                ) }

                {/* <div className = { 'ProgressBar' } >
                    <div className = { 'ProgressBarIndicator' } style = { progressStore.getProgressBarStyle() } />
                    <span>{progressStore.formatProgressInPercentage()}</span>
                </div> */}

                <LoadingIndicator />
            </div>
        </AnimationContainer>
    )

}

export default inject('progressStore')(observer(Progress));
