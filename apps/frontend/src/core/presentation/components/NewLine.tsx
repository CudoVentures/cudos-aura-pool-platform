import React from 'react';

type Props = {
    text: string;
}

export default function NewLine({ text }: Props) {
    return (
        <>
            { text.split('\n').map((line: string, i: number, splitArray: string[]) => {
                return (
                    <>
                        { line }
                        { i + 1 < splitArray.length && (
                            <br />
                        ) }
                    </>
                )
            }) }
        </>
    )
}
