// XML to JSON Converter - Modernize Style
class XMLToJSONConverter {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Ctrl+Enter 키보드 단축키 지원
        const xmlInput = document.getElementById('xmlInput');
        if (xmlInput) {
            xmlInput.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                    this.convertXMLtoJSON();
                }
            });
        }
    }

    convertXMLtoJSON() {
        const xmlInput = document.getElementById('xmlInput');
        const jsonOutput = document.getElementById('jsonOutput');
        const alertDiv = document.getElementById('alert');

        if (!xmlInput || !jsonOutput || !alertDiv) {
            console.error('Required DOM elements not found');
            return;
        }

        const xmlText = xmlInput.value.trim();
        
        // Clear previous results
        jsonOutput.value = '';
        this.hideAlert();

        if (!xmlText) {
            this.showAlert('XML 데이터를 입력하세요.', 'error');
            return;
        }

        try {
            // Show loading state
            if (window.showLoading) {
                window.showLoading(jsonOutput);
            }

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");

            // Check for parsing errors
            if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
                throw new Error("유효하지 않은 XML 형식입니다.");
            }

            const jsonObject = this.xmlToJSON(xmlDoc);
            const formattedJSON = JSON.stringify(jsonObject, null, 2);
            
            jsonOutput.value = formattedJSON;
            this.showAlert('XML이 JSON으로 성공적으로 변환되었습니다.', 'success');
            
            if (window.showNotification) {
                window.showNotification('XML → JSON 변환이 완료되었습니다.', 'success');
            }
        } catch (error) {
            console.error('XML Conversion Error:', error);
            this.showAlert('XML 변환 중 오류가 발생했습니다: ' + error.message, 'error');
            
            if (window.showNotification) {
                window.showNotification('XML 변환 중 오류가 발생했습니다.', 'error');
            }
        } finally {
            // Hide loading state
            if (window.hideLoading) {
                window.hideLoading(jsonOutput);
            }
        }
    }

    xmlToJSON(xml) {
        let obj = {};
        
        if (xml.nodeType === 1) { // element
            // Handle attributes
            if (xml.attributes.length > 0) {
                obj["@attributes"] = {};
                for (let j = 0; j < xml.attributes.length; j++) {
                    const attribute = xml.attributes.item(j);
                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType === 3) { // text
            const text = xml.nodeValue.trim();
            if (text) {
                obj = text;
            }
        }

        // Handle child nodes
        if (xml.hasChildNodes()) {
            for (let i = 0; i < xml.childNodes.length; i++) {
                const item = xml.childNodes.item(i);
                const nodeName = item.nodeName;
                
                if (item.nodeType === 3) { // text node
                    const text = item.nodeValue.trim();
                    if (text) {
                        if (typeof obj === "object" && Object.keys(obj).length === 0) {
                            obj = text;
                        } else if (typeof obj === "object") {
                            obj["#text"] = text;
                        }
                    }
                } else if (item.nodeType === 1) { // element node
                    if (typeof obj[nodeName] === "undefined") {
                        obj[nodeName] = this.xmlToJSON(item);
                    } else {
                        if (typeof obj[nodeName].push === "undefined") {
                            const old = obj[nodeName];
                            obj[nodeName] = [];
                            obj[nodeName].push(old);
                        }
                        obj[nodeName].push(this.xmlToJSON(item));
                    }
                }
            }
        }

        return obj;
    }

    showAlert(message, type = 'error') {
        const alertDiv = document.getElementById('alert');
        if (alertDiv) {
            alertDiv.textContent = message;
            alertDiv.className = `alert-message alert-${type}`;
            alertDiv.style.display = 'block';
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                this.hideAlert();
            }, 5000);
        }
    }

    hideAlert() {
        const alertDiv = document.getElementById('alert');
        if (alertDiv) {
            alertDiv.style.display = 'none';
        }
    }

    copyOutput() {
        const jsonOutput = document.getElementById('jsonOutput');
        if (jsonOutput && jsonOutput.value) {
            navigator.clipboard.writeText(jsonOutput.value).then(() => {
                if (window.showNotification) {
                    window.showNotification('JSON이 클립보드에 복사되었습니다.', 'success');
                }
            }).catch(() => {
                // Fallback for older browsers
                jsonOutput.select();
                document.execCommand('copy');
                if (window.showNotification) {
                    window.showNotification('JSON이 클립보드에 복사되었습니다.', 'success');
                }
            });
        }
    }

    tryExample() {
        const exampleCode = document.getElementById('exampleXML');
        const xmlInput = document.getElementById('xmlInput');
        
        if (exampleCode && xmlInput) {
            xmlInput.value = exampleCode.textContent;
            xmlInput.focus();
            this.convertXMLtoJSON();
        }
    }

    clearInput() {
        const xmlInput = document.getElementById('xmlInput');
        const jsonOutput = document.getElementById('jsonOutput');
        
        if (xmlInput) xmlInput.value = '';
        if (jsonOutput) jsonOutput.value = '';
        
        this.hideAlert();
        
        if (window.showNotification) {
            window.showNotification('입력이 초기화되었습니다.', 'info');
        }
    }
}

// Global functions for backward compatibility
function convertXMLtoJSON() {
    if (window.xmlToJSONConverter) {
        window.xmlToJSONConverter.convertXMLtoJSON();
    }
}

function copyOutput() {
    if (window.xmlToJSONConverter) {
        window.xmlToJSONConverter.copyOutput();
    }
}

function tryExample() {
    if (window.xmlToJSONConverter) {
        window.xmlToJSONConverter.tryExample();
    }
}

function clearInput() {
    if (window.xmlToJSONConverter) {
        window.xmlToJSONConverter.clearInput();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.xmlToJSONConverter = new XMLToJSONConverter();
}); 