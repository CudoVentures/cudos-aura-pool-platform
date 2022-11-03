import React from 'react';

import '../styles/field-column-wrapper.css';

type Props = {
    field: React.ReactNode;
    helperText: string | React.ReactNode;
}

export default function FieldColumnWrapper({ field, helperText, children }: React.PropsWithChildren < Props >) {

    return (
        <div className = { 'FieldColumnWrapper' } >
            { field }
            { helperText !== null && (
                <div className = { 'HelperText' } > { helperText } </div>
            ) }
            { children }
        </div>
    )

}

FieldColumnWrapper.defaultProps = {
    helperText: null,
}
