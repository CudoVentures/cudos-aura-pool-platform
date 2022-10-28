import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import AppRoutes from '../../../app-routes/entities/AppRoutes';

import AlertStore from '../../../../core/presentation/stores/AlertStore';
import AppStore from '../../../../core/presentation/stores/AppStore';
import TableState from '../../../../core/presentation/stores/TableState';

import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';

import Actions, { ActionsHeight, ActionsLayout } from '../../../../core/presentation/components/Actions';
import Svg, { SvgSize } from '../../../../core/presentation/components/Svg';
import Button, { ButtonColor, ButtonPadding, ButtonRadius, ButtonType } from '../../../../core/presentation/components/Button';
import Input from '../../../../core/presentation/components/Input';
import Select from '../../../../core/presentation/components/Select';
import { MenuItem } from '@mui/material'
import Tooltip from '../../../../core/presentation/components/Tooltip';
import TextWithTooltip from '../../../../core/presentation/components/TextWithTooltip';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import Popover from '../../../../core/presentation/components/Popover';
import UploaderComponent from '../../../../core/presentation/components/UploaderComponent';
import Table, { createTableCellString, createTableRow } from '../../../../core/presentation/components/Table';

import SvgLogo from '../vectors/info.svg';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import Checkbox from '../../../../core/presentation/components/Checkbox';
import '../styles/ui-kit-page.css';
import ExampleModal from './ExampleModal';
import ExampleModalStore from '../stores/ExampleModalStore';
import Autocomplete from '../../../../core/presentation/components/Autcomplete';
import AutocompleteOption from '../../../../core/entities/AutocompleteOption';
import SingleDatepicker from '../../../../core/presentation/components/SingleDatepicker';
import RangeDatepicker, { RangeDatepickerState } from '../../../../core/presentation/components/RangeDatepicker';
import S from '../../../../core/utilities/Main';
import ValidationState from '../../../../core/presentation/stores/ValidationState';

type Props = {
    appStore?: AppStore
    alertStore?: AlertStore;
    exampleModalStore?: ExampleModalStore;
}

function UiKitPage({ appStore, alertStore, exampleModalStore }: Props) {
    const navigate = useNavigate();
    const validationState = useRef(new ValidationState()).current;
    const validation1 = useRef(validationState.addEmptyValidation('Empty miners')).current;
    const validation2 = useRef(validationState.addEmptyValidation('Empty miners')).current;
    const validation3 = useRef(validationState.addEmptyValidation('Empty miners')).current;
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [popoverAnchor, setPopupAnchor] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [selectValue, setSelectValue] = useState('');
    const [autocompleteSingleValue, setAutocompleteSingleValue] = useState(null);
    const [autocompleteMultiValue, setAutocompleteMultiValue] = useState([]);
    const [singleDatepickerValue, setSingleDatepickerValue] = useState(new Date());
    const [rangeDatepickerValue, setRangeDatepickerValue] = useState(new RangeDatepickerState(Date.now() - 100000000, Date.now()));
    const [checkboxValue, setCheckboxValue] = useState(S.INT_FALSE);

    useEffect(() => {
        validationState.setShowErrors(true);
    }, []);

    function onClickNavigate() {
        navigate(AppRoutes.NOT_FOUND);
    }

    function onClickShowSimpleAlert() {
        alertStore.show('Alert', () => {
            console.log('You clicked positive label');
        }, () => {
            console.log('You clicked negative label');
        });
    }

    function onClickShowComplexAlert() {
        alertStore.msg = 'The message';
        alertStore.negativeLabel = 'Neg';
        alertStore.positiveLabel = 'Pos';
        alertStore.neutralLabel = 'Neutral';
        alertStore.positiveListener = function positiveListener() {
            console.log('You clicked positive label');
        };
        alertStore.negativeListener = function negativeLabel() {
            console.log('You clicked negative label');
        };
        alertStore.neutralListener = function neutralListener() {
            console.log('You clicked neutral listener');
        }
        alertStore.visible = true;
    }

    function onClickDim() {
        appStore.incremenetDimmer();
        setTimeout(() => {
            appStore.decrementDimmer();
        }, 3000);
    }

    function onClickDisableActions() {
        appStore.disableActions();
        setTimeout(() => {
            appStore.enableActions();
        }, 3000);
    }

    function onShowPopover(e) {
        setPopupAnchor(e.target);
        setPopoverOpen(true);
    }

    function onClosePopover() {
        setPopoverOpen(false);
        setPopupAnchor(null);
    }

    function showModal() {
        exampleModalStore.showSignal('modal content');
    }

    return (
        <PageLayoutComponent
            className = { 'UiKitPage' }
            modals = {
                <>
                    <ExampleModal />,
                </>
            } >

            <div className = { 'AppContent' } >
                <div className = { 'UiKit' } >Ui Kit Preview</div>

                <div className = { 'FeatureBox' }>
                    <label>Page</label>
                    <div onClick = { onClickNavigate } className = { 'Clickable' }>Navigate to Not found page</div>
                </div>

                <div className = { 'FeatureBox' }>
                    <label>Alert</label>
                    <div onClick = { onClickShowSimpleAlert } className = { 'Clickable' }>Show simple alert</div>
                    <div onClick = { onClickShowComplexAlert } className = { 'Clickable' }>Show complex alert</div>
                </div>

                <div className = { 'FeatureBox' } >
                    <label>Modal</label>
                    <div onClick = { showModal } >Show modal</div>
                </div>

                <div className = { 'FeatureBox' }>
                    <label>Dim</label>
                    <div onClick = { onClickDim } className = { 'Clickable' }>Dim/Blur for 3 seconds</div>
                </div>

                <div className = { 'FeatureBox' }>
                    <label>Disable events</label>
                    <div onClick = { onClickDisableActions } className = { 'Clickable' }>Disable pointer events for 3 seconds</div>
                </div>

                <div className = { 'FeatureBox' }>
                    <label>Loading indicator</label>
                    <LoadingIndicator inline = { true } />
                    <LoadingIndicator />
                </div>

                <div className = { 'FeatureBox' }>
                    <label>Popup over</label>
                    <div>
                        <span onClick = { onShowPopover } > Click to show popover</span>
                    </div>
                    <Popover
                        anchorEl = { popoverAnchor }
                        open = { popoverOpen }
                        onClose = { onClosePopover } >
                        Popover content<br />
                        It could be any html/react node
                    </Popover>
                </div>

                <div className = { 'FeatureBox' }>
                    <label>Tooltips</label>
                    <div>
                        <Tooltip title = { 'tooltiptext' }>
                            <span>Trigget text</span>
                        </Tooltip>
                    </div>
                    <TextWithTooltip text = { 'label' } tooltipText = { 'tooltip text' } />
                </div>

                <div className = { 'FeatureBox' }>
                    <label>Uploader</label>
                    <div>
                        Upload files
                        <UploaderComponent
                            id = { this }
                            params = { {
                                'maxSize': 73400320, // 70MB
                                'onExceedLimit': () => {
                                    this.props.alertStore.show('', 'Максималният размер на файловете е 70MB!');
                                },
                                'multi': true,
                                onReadFileAsBase64: (base64File, responseData, files: any[], i: number) => {
                                    alertStore.show('success');
                                },
                            } } />
                    </div>
                </div>

                <div className = { 'FeatureBox' } >
                    <label>Headings</label>
                    <div className={'H1'}>Heading 1</div>
                    <div className={'H2'}>Heading 2</div>
                    <div className={'H2_1'}>Heading 2.1</div>
                    <div className={'H3'}>Heading 3</div>
                    <div className={'B1'}>Body 1</div>
                    <div className={'B2'}>Body 2</div>
                    <div className={'B3'}>Body 3</div>
                    <div className={'B4'}>Body 4</div>
                </div>

                <div className = { 'FeatureBox' } >
                    <label>Inputs</label>
                    <div className = { 'InputsGrid' } >
                        <Input
                            label = { 'input label 2' }
                            placeholder = { 'placeholder' }
                            value = { inputValue }
                            onChange = { setInputValue } />
                        <Input
                            label = { ' ' }
                            disabled = { true }
                            value = { inputValue }
                            onChange = { setInputValue } />
                        <Input
                            label = { 'input with error' }
                            error = { true }
                            value = { inputValue }
                            onChange = { setInputValue } />
                        <Input
                            label = { ' ' }
                            gray = { true }
                            disabled = { true }
                            value = { inputValue }
                            onChange = { setInputValue } />
                    </div>
                    <div className = { 'InputsGrid' } >
                        <Select
                            label = { 'input label 2' }
                            placeholder = { 'placeholder' }
                            value = { selectValue }
                            onChange = { setSelectValue } >
                            <MenuItem value = { 1 } >1</MenuItem>
                            <MenuItem value = { 2 } >2</MenuItem>
                        </Select>
                        <Select
                            label = { ' ' }
                            disabled = { true }
                            value = { selectValue }
                            onChange = { setSelectValue } >
                            <MenuItem value = { 1 } >1</MenuItem>
                            <MenuItem value = { 2 } >2</MenuItem>
                        </Select>
                        <Select
                            label = { 'input with error' }
                            error = { true }
                            value = { selectValue }
                            inputValidation={validation1}
                            onChange = { setSelectValue } >
                            <MenuItem value = { 1 } >1</MenuItem>
                            <MenuItem value = { 2 } >2</MenuItem>
                        </Select>
                    </div>
                    <div className = { 'InputsGrid' } >
                        <Autocomplete
                            label = { 'Label' }
                            options = { [
                                new AutocompleteOption(1, 1),
                                new AutocompleteOption(2, 2),
                            ] }
                            inputValidation={validation2}
                            value = { autocompleteSingleValue }
                            onChange = { setAutocompleteSingleValue } />
                        <Autocomplete
                            label = { ' ' }
                            error = { true }
                            options = { [
                                new AutocompleteOption(1, 1),
                                new AutocompleteOption(2, 2),
                            ] }
                            value = { autocompleteSingleValue }
                            onChange = { setAutocompleteSingleValue } />
                        <Autocomplete
                            label = { ' ' }
                            multiple = { true }
                            placeholder = { 'autocomplete with multiple options' }
                            options = { [
                                new AutocompleteOption(1, 'Some long text that 1'),
                                new AutocompleteOption(2, 'Some long text that 2'),
                                new AutocompleteOption(3, 'Some long text that 3'),
                            ] }
                            value = { autocompleteMultiValue }
                            onChange = { setAutocompleteMultiValue } />
                    </div>
                    <div className = { 'InputsGrid' } >
                        <SingleDatepicker
                            label = { 'name of the field' }
                            selected = { singleDatepickerValue }
                            inputValidation={validation3}
                            onChange = { setSingleDatepickerValue } />
                        <RangeDatepicker
                            label = { 'Name of the field range' }
                            datepickerState = { rangeDatepickerValue }
                            onChange = { (startDate, endDate) => {
                                setRangeDatepickerValue(new RangeDatepickerState(startDate, endDate))
                            } } />
                    </div>
                    <div className = { 'InputsGrid' } >
                        <Checkbox
                            label = { 'name of the field' }
                            value = { checkboxValue }
                            onChange = { setCheckboxValue } />
                    </div>
                </div>

                <div className = { 'FeatureBox' }>
                    <label>Buttons</label>
                    <Actions>
                        <Button>
                            <Svg size = { SvgSize.CUSTOM } svg = { SvgLogo } />
                            Button rounded color 1 default padding default radius
                        </Button>
                        <Button
                            color = { ButtonColor.SCHEME_2 }
                            padding = { ButtonPadding.PADDING_24 }
                            radius = { ButtonRadius.MAX }>
                            <Svg size = { SvgSize.CUSTOM } svg = { AcUnitIcon } />
                            Button rounded color 2 24 padding max radius
                        </Button>
                        <Button
                            color = { ButtonColor.SCHEME_3 }
                            padding = { ButtonPadding.PADDING_48 } >
                            Button rounded color 3 48 padding
                        </Button>
                    </Actions>
                    <Actions height = { ActionsHeight.HEIGHT_42 } layout = { ActionsLayout.LAYOUT_COLUMN_FULL } >
                        <Button
                            type = { ButtonType.TEXT_INLINE }>
                            Button inline color 1 default padding default radius
                        </Button>
                        <Button
                            type = { ButtonType.TEXT_INLINE }
                            color = { ButtonColor.SCHEME_2 } >
                            Button inline color 2 default padding default radius
                        </Button>
                        <Button
                            type = { ButtonType.TEXT_INLINE }
                            color = { ButtonColor.SCHEME_3 } >
                            Button inline color 3 default padding default radius
                        </Button>
                    </Actions>
                </div>

                <div className = { 'FeatureBox' }>
                    <label>Table</label>
                    <Table
                        widths = { ['30%', '70%'] }
                        legend = { ['Column1', 'Column 2'] }
                        tableState = { new TableState(0, [], () => {
                            // used to fetech new data
                        }) }
                        rows = { [
                            createTableRow([
                                createTableCellString('Row 1'),
                                createTableCellString('Row 2'),
                            ]),
                            createTableRow([
                                createTableCellString('Row 3'),
                                createTableCellString('Row 4'),
                            ]),
                        ] } />

                </div>

            </div>

        </PageLayoutComponent>
    )

}

export default inject((stores) => stores)(observer(UiKitPage));

// function a() {
//     return (
//         <div className={'FlexRow'} style={{
//             gap: '20px',
//             padding: '100px',
//             background: 'var(--color-primary)',
//         }}>
//             <div className={'H1'}>Heading 1</div>
//             <div className={'H2'}>Heading 2</div>
//             <div className={'H2_1'}>Heading 2.1</div>
//             <div className={'H3'}>Heading 3</div>
//             <div className={'B1'}>Body 1</div>
//             <div className={'B2'}>Body 2</div>
//             <div className={'B3'}>Body 3</div>
//             <div className={'B4'}>Body 4</div>
//         </div>
//         <div style = { { 'width': '1000px', 'height': '500px', 'margin': 'auto' } } className = { 'FlexSingleCenter FlexColumn' } >
//             <Input
//                 label = { 'test' } />

//             <Input
//                 label = { 'test' } error />

//             <Select
//                 label = { 'test' } >
//                 <MenuItem value = { 1 } >1</MenuItem>
//                 <MenuItem value = { 2 } >2</MenuItem>
//             </Select>

//             <Select
//                 label = { 'test' }
//                 error >
//                 <MenuItem value = { 1 } >1</MenuItem>
//                 <MenuItem value = { 2 } >2</MenuItem>
//             </Select>

//             <Actions>
//                 <Button type = {ButtonType.ROUNDED } color = { ButtonColor.SCHEME_1 } >button 01</Button>
//                 <Button type = {ButtonType.ROUNDED } color = { ButtonColor.SCHEME_2 } >button 02</Button>
//                 <Button type = { ButtonType.TEXT_INLINE } color = { ButtonColor.SCHEME_1 } >button 03</Button>
//                 <Button type = { ButtonType.TEXT_INLINE } color = { ButtonColor.SCHEME_2 } >button 04</Button>
//             </Actions>
//         </div>
//         <Tooltip title = { 'some info' } arrow ><span>TOOLTIP</span></Tooltip>
//         <TextWithTooltip text='TEXT WITH TOOLTIP' tooltipText='TOOLTIP TEXT' />
//         <span onClick = { onClickNavigate } >UiKitPage</span>
//         <span onClick = { onClickShowAlert } >show alert</span>
//     )
// }
