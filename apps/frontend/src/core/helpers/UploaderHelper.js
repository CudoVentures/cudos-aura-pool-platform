// version 3.7.0
export default class UploaderHelper {

    static isSupported() {
        if (typeof (FileReader) === 'undefined' || typeof (FileList) === 'undefined') {
            return false;
        }

        if (typeof (new FileReader().readAsDataURL) === 'undefined') {
            return false;
        }

        if (typeof (new XMLHttpRequest().upload) === 'undefined') {
            return false;
        }

        return true;
    }

    static newInstance(params) {
        if (UploaderHelper.isSupported() === false) {
            console.error('Browser is  not suported. Please update to latest version of chrome/firefox/opera/safari or Internet Explorer 10 or newer');
            return null;
        }

        return new UploaderHelper(params);
    }

    constructor(params) {
        if (params.id !== undefined) {
            this.inputN = document.getElementById(params.id);
            if (this.inputN === null) {
                console.error(`The element with id '${params.id}' is not found`);
                return;
            }
        } else if (params.node !== undefined) {
            this.inputN = params.node;
            if (this.inputN === null) {
                console.error('The input element was not found');
                return;
            }
        } else {
            this.inputN = null;
        }

        if (this.inputN !== null) {
            if (this.inputN.tagName !== 'INPUT') {
                console.error('The element should be input type=\'file\'');
                return;
            }
            this.inputN.type = 'file';
            this.inputN.style.cursor = 'pointer';
        }

        if (params.maxSize === undefined) {
            console.warn('It is highly recommended to set \'maxSize\' attribute of Uploader to be equal to the value on the server. Now Uploader will use default value of 2097152 bytes(2MB).');
            this.maxSize = 1 << 21;
        } else {
            this.maxSize = params.maxSize;
        }

        this.controller = params.controller ?? null;
        this.progressWindow = (params.progressWindow !== undefined ? params.progressWindow : true);
        this.uploadLabel = (params.label !== undefined ? params.label : 'Uploading...');
        this.dataParamName = (params.dataParamName !== undefined ? params.dataParamName : 'file');
        this.filenameParamName = (params.filenameParamName !== undefined ? params.filenameParamName : 'filename');
        this.typeParamType = (params.typeParamType !== undefined ? params.typeParamType : 'type');
        this.bgColor = (params.bgColor !== undefined ? params.bgColor : '#a2a2a2');
        this.bgColorIndicator = (params.bgColorIndicator !== undefined ? params.bgColorIndicator : '#a2a2a2');
        this.bgColorCard = (params.bgColorCard !== undefined ? params.bgColorCard : '#fff');

        this.onUpload = (params.onUpload !== undefined ? params.onUpload : null);
        this.onError = (params.onError !== undefined ? params.onError : null);
        this.onBeforeSend = (params.onBeforeSend !== undefined ? params.onBeforeSend : null);
        this.onProgress = (params.onProgress !== undefined ? params.onProgress : null);
        this.onExceedLimit = (params.onExceedLimit !== undefined ? params.onExceedLimit : null);
        this.onBeforeStart = (params.onBeforeStart !== undefined ? params.onBeforeStart : null);
        this.onFinish = (params.onFinish !== undefined ? params.onFinish : null);
        this.onExtError = (params.onExtError !== undefined ? params.onExtError : null);
        this.onReadFileAsBase64 = (params.onReadFileAsBase64 !== undefined ? params.onReadFileAsBase64 : null);

        if (this.inputN !== null) {
            if (params.position !== undefined) {
                this.inputN.parentNode.style.position = params.position;
            } else {
                const position = window.getComputedStyle(this.inputN.parentNode).getPropertyValue('position');
                if (position !== 'absolute' && position !== 'fixed') {
                    this.inputN.parentNode.style.position = 'relative';
                }
            }

            this.inputN.style.display = 'inline-block';
            this.inputN.style.position = 'absolute';
            this.inputN.style.width = '100%';
            this.inputN.style.height = '100%';
            this.inputN.style.left = '0';
            this.inputN.style.top = '0';
            this.inputN.style.opacity = 0;
            this.inputN.style.zIndex = 512;
        }

        this.fileSizeLimitDelegate = params.fileSizeLimitDelegate;
        if (params.fileSizeLimitDelegate === undefined) {
            this.fileSizeLimit = (params.fileSizeLimit !== undefined ? params.fileSizeLimit : Number.MAX_SAFE_INTEGER);
            if (params.multi === true && this.fileSizeLimit > 1) {
                if (this.inputN !== null) {
                    this.inputN.setAttribute('multiple', '');
                }
            } else {
                if (this.inputN !== null) {
                    this.inputN.removeAttribute('multiple');
                }
                if (this.fileSizeLimit > 1) {
                    this.fileSizeLimit = 1;
                }
            }
        } else {
            this.fileSizeLimit = Number.MAX_SAFE_INTEGER;
            if (this.inputN !== null) {
                if (params.multi === true) {
                    this.inputN.setAttribute('multiple', '');
                } else {
                    this.inputN.removeAttribute('multiple');
                }
            }
        }

        if (params.fileExt !== undefined) {
            if (this.inputN !== null) {
                this.inputN.setAttribute('accept', params.fileExt);
            }
            this.exts = params.fileExt.split(',');
            for (let i = this.exts.length - 1; i >= 0; --i) {
                this.exts[i] = this.exts[i].trim().toLowerCase();
            }
        } else {
            if (this.inputN !== null) {
                this.inputN.removeAttribute('accept');
            }
            this.exts = [];
        }

        this.connect();
    }

    disconnect() {
        if (this.inputN !== null) {
            this.inputN.removeEventListener('change', this.onChange);
        }
    }

    connect() {
        if (this.inputN !== null) {
            this.inputN.addEventListener('change', this.onChange);
        }
    }

    onChange = () => {
        this.files = this.inputN.files;
        if (this.prepareUpload() === true) {
            this.runUploading();
        }
    }

    uploadFiles(files) {
        this.files = files;
        if (this.prepareUpload() === true) {
            this.runUploading();
        }
    }

    uploadBase64(base64String) {
        let fileType = '';
        const endMimeType = base64String.indexOf(';');
        if (endMimeType !== -1) {
            const startMimeType = base64String.lastIndexOf(':', endMimeType);
            if (startMimeType !== -1) {
                fileType = base64String.substring(startMimeType + 1, endMimeType);
            }
        }

        this.files = [{
            'name': '',
            'type': fileType,
            'size': base64String.length / 4 * 3,
        }];
        if (this.prepareUpload() === true) {
            this.initProgressWindow();
            if (this.onBeforeStart !== null) {
                this.onBeforeStart(this.filesLength);
            }
            this.filePointer = 0;
            this.ajaxUploadURLEncodedByBase64(base64String);
        }
    }

    prepareUpload() {
        if (this.files.length === 0) {
            return false;
        }

        let fileLimit = this.fileSizeLimit;
        if (this.fileSizeLimit === Number.MAX_SAFE_INTEGER && this.fileSizeLimitDelegate !== undefined) {
            fileLimit = this.fileSizeLimitDelegate();
        }

        this.filesLength = Math.min(fileLimit, this.files.length);
        if (this.filesLength === 0) {
            return false;
        }

        this.totalBytes = 0;

        let j;
        let ext;
        let dotIndex;
        let error = false;
        for (let i = this.filesLength; i-- > 0;) {
            this.totalBytes += this.files[i].size;
            if (this.files[i].size > this.maxSize) {
                if (this.onExceedLimit !== null) {
                    this.onExceedLimit(this.files[i].name, this.files[i].size, this.maxSize);
                } else {
                    console.warn(`${this.files[i].name} exceeds file size limit (${this.maxSize} bytes)`);
                }
                error = true;
            }
            if (this.exts.length > 0) {
                let fileMimeTypeLowerCase = this.files[i].type.toLowerCase();
                if (fileMimeTypeLowerCase === '') {
                    fileMimeTypeLowerCase = this.files[i].name.substring(this.files[i].name.indexOf('.'));
                }
                for (j = this.exts.length - 1; j >= 0; --j) {
                    const extWithoutDot = this.exts[j].replace('.', '').toLowerCase();
                    if (fileMimeTypeLowerCase.indexOf(extWithoutDot) !== -1) {
                        break;
                    }
                }
                if (j === -1) {
                    if (this.onExtError !== null) {
                        this.onExtError(this.files[i].name);
                    }
                    error = true;
                }
            }
        }
        return !error;
    }

    onGlobalProgress(e) {
        if (this.onProgress !== null) {
            this.onProgress(e.loaded, e.total, this.filePointer + 1, this.filesLength);
        }

        if (this.progressWindow === false) {
            return;
        }

        let percentage = e.loaded / e.total;
        const percentStep = (1 / this.filesLength * 100 * percentage);

        percentage = (percentage * 100).toFixed(2);

        this.globalProgressBarLabelN.innerHTML = `${(this.filePointer + 1)} / ${this.filesLength}`;
        this.globalProgressBarN.style.width = `${(this.filePointer / this.filesLength * 100 + percentStep).toFixed(2)}%`;

        this.localProgressBarLabelN.innerHTML = `${percentage}%`;
        this.localProgressBarN.style.width = `${percentage}%`;
    }

    runUploading() {
        this.initProgressWindow();
        if (this.onBeforeStart !== null) {
            this.onBeforeStart(this.filesLength);
        }
        this.filePointer = 0;
        this.upload();
    }

    upload() {
        const file = this.files[this.filePointer];
        const reader = new FileReader();
        if (this.controller !== null) {
            reader.onload = this.ajaxUploadURLEncodedByEvent.bind(this);
        } else {
            reader.onload = this.onReadFile.bind(this);
        }
        reader.readAsDataURL(file, 'UTF-8');
    }

    nextUpload() {
        ++this.filePointer;
        if (this.filePointer === this.filesLength) {
            if (this.onFinish !== null) {
                this.onFinish();
            }
            if (this.inputN !== null) {
                this.inputN.value = '';
            }
            this.removeProgressWindow();
            return;
        }
        this.upload();
    }

    ajaxUploadURLEncodedByEvent(e) {
        const result = e.target.result;
        const filename = this.files[this.filePointer].name;
        const fileType = this.files[this.filePointer].type !== '' ? this.files[this.filePointer].type : 'application/octet-stream';

        this.ajaxUploadURLEncoded(result, filename, fileType);
    }

    ajaxUploadURLEncodedByBase64(base64String) {
        const fileType = this.files[this.filePointer].type !== '' ? this.files[this.filePointer].type : 'application/octet-stream';

        this.ajaxUploadURLEncoded(base64String, '', fileType);
    }

    ajaxUploadURLEncoded(base64String, filename, fileType) {
        const next = () => {
            const ajax = new XMLHttpRequest();

            const queryIndex = this.controller.indexOf('?');
            const queryString = (queryIndex !== -1 ? `&${this.controller.substring(queryIndex + 1)}` : '');

            ajax.upload.addEventListener('progress', (ev) => {
                this.onGlobalProgress(ev);
            }, false);
            ajax.open('POST', this.controller, true);
            ajax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

            ajax.onreadystatechange = async () => {
                if (ajax.readyState !== 4) {
                    return;
                }

                if (ajax.status !== 200) {
                    this.removeProgressWindow();
                    if (this.onError !== null) {
                        this.onError(ajax.status, ajax.responseText);
                    }
                    return;
                }

                if (this.onUpload !== null) {
                    await this.onUpload(base64String, ajax.responseText, filename, filetype, this.files, this.filePointer);
                }

                this.nextUpload();
            };
            ajax.send(
                // eslint-disable-next-line prefer-template
                encodeURIComponent(this.filenameParamName)
                + '=' + encodeURIComponent(filename)
                + '&'
                + encodeURIComponent(this.typeParamType)
                + '=' + encodeURIComponent(fileType)
                + '&'
                + encodeURIComponent(this.dataParamName)
                + '=' + encodeURIComponent(base64String)
                + queryString,
            );
        };

        if (this.onBeforeSend !== null) {
            const lookFor = ';base64,';
            const startIndex = base64String.indexOf(lookFor) + lookFor.length;
            const resultForSend = startIndex === -1 ? base64String : base64String.substring(startIndex);

            this.onBeforeSend(resultForSend, (processedResultForSend) => {
                const prefix = startIndex === -1 ? '' : base64String.substring(0, startIndex);
                base64String = prefix + processedResultForSend;
                next();
            });
        } else {
            next();
        }
    }

    async onReadFile(e) {
        const result = e.target.result;
        const filename = this.files[this.filePointer].name;
        const fileType = this.files[this.filePointer].type !== '' ? this.files[this.filePointer].type : 'application/octet-stream';

        if (this.onReadFileAsBase64 !== null) {
            await this.onReadFileAsBase64(result, filename, fileType, this.files, this.filePointer);
        }

        this.nextUpload();
    }

    initProgressWindow() {
        if (this.progressWindow === false) {
            return;
        }

        this.progressWindowN = document.createElement('table');
        this.progressWindowN.setAttribute('style', 'width:100%; height:100%; display:table; position:fixed; left:0; top:0; font-size:16px; font-weight:400; transition:opacity 0.25s; background:rgba(0, 0, 0, 0.6); z-index:1048576;');
        // eslint-disable-next-line prefer-template
        this.progressWindowN.innerHTML = '<div style="display:table-cell; text-align:center; vertical-align:middle;">\
                                                <div style="width:50%; box-sizing:border-box; border-radius:4px; padding:32px; margin:auto; background:' + this.bgColorCard + '; box-shadow:0 0 16px 0 #333;">\
                                                    <div style="margin-bottom:32px;">' + this.uploadLabel + '</div>\
                                                    <div style="line-height:32px; position:relative; color:#fff; border-radius:4px; margin-bottom:16px; background:' + this.bgColorIndicator + '; overflow:hidden;">\
                                                        <span id="globalGrogressBarLabel" style="position:relative; z-index:1;"></span>\
                                                        <div id="globalProgressBar" style="width:0; height:100%; position:absolute; left:0; top:0; background:' + this.bgColor + ';"></div>\
                                                        <div style="width:100%; height:100%; position:absolute; left:0; top:0; border-radius:inherit; box-shadow:inset 0px 0px 6px 0 #222"></div>\
                                                    </div>\
                                                    <div style="line-height:32px; position:relative; color:#fff; border-radius:4px; background:' + this.bgColorIndicator + '; overflow:hidden;">\
                                                        <span id="localProgressBarLabel" style="position:relative; z-index:1;"></span>\
                                                        <div id="localProgressBar" style="width:0; height:100%; position:absolute; left:0; top:0;  background:' + this.bgColor + ';"></div>\
                                                        <div style="width:100%; height:100%; position:absolute; left:0; top:0; border-radius:inherit; box-shadow:inset 0px 0px 6px 0 #222"></div>\
                                                    </div>\
                                                </div>\
                                            </div>';

        document.body.appendChild(this.progressWindowN);
        this.globalProgressBarLabelN = document.getElementById('globalGrogressBarLabel');
        this.globalProgressBarLabelN.removeAttribute('id');

        this.globalProgressBarN = document.getElementById('globalProgressBar');
        this.globalProgressBarN.removeAttribute('id');

        this.localProgressBarLabelN = document.getElementById('localProgressBarLabel');
        this.localProgressBarLabelN.removeAttribute('id');

        this.localProgressBarN = document.getElementById('localProgressBar');
        this.localProgressBarN.removeAttribute('id');
    }

    removeProgressWindow() {
        if (this.progressWindow === false) {
            return;
        }

        this.progressWindowN.style.opacity = 0;
        setTimeout(() => {
            document.body.removeChild(this.progressWindowN);
            delete this.progressWindowN;
            delete this.globalProgressBarLabelN;
            delete this.globalProgressBarN;
            delete this.localProgressBarLabelN;
            delete this.localProgressBarN;
        }, 300);
    }

}
