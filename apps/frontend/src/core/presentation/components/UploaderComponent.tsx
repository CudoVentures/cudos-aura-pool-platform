import React, { useEffect, useRef, useState } from 'react';
import S from '../../utilities/Main';
import UploaderHelper from '../../helpers/UploaderHelper';

type Props = {
    className?: string;
    id: any;
    params: any;
}

export default function UploaderComponent({ className, id, params }: Props) {
    const inputRef = useRef < HTMLInputElement >(null);
    const [initedId, setInitedId] = useState(null);
    const [uploader, setUploader] = useState(null);

    useEffect(() => {
        let uploaderCache: UploaderHelper = uploader;
        if (uploaderCache === null || id !== initedId) {
            uploaderCache = UploaderHelper.newInstance(Object.assign(params, {
                'node': inputRef.current,
            }));
            setUploader(uploaderCache);
            setInitedId(id);
        } else {
            uploaderCache.connect();
            Object.assign(uploaderCache, params);
        }

        return () => {
            uploaderCache.disconnect();
        };
    });

    return (
        <input ref = { inputRef } className = { className } type = { 'file' } />
    );
}

UploaderComponent.defaultProps = {
    'className': S.Strings.EMPTY,
};
