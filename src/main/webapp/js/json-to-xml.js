// JSON to XML Converter - Modernize Style
class JSONToXMLConverter {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Ctrl+Enter 키보드 단축키 지원
        const jsonInput = document.getElementById('jsonInput');
        if (jsonInput) {
            jsonInput.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                    this.convertJSONtoXML();
                }
            });
        }
    }

    convertJSONtoXML() {
        const jsonInput = document.getElementById('jsonInput');
        const xmlOutput = document.getElementById('xmlOutput');
        const alertDiv = document.getElementById('alert');

        if (!jsonInput || !xmlOutput || !alertDiv) {
            console.error('Required DOM elements not found');
            return;
        }

        const jsonText = jsonInput.value.trim();
        
        // Clear previous results
        xmlOutput.value = '';
        this.hideAlert();

        if (!jsonText) {
            this.showAlert('JSON 데이터를 입력하세요.', 'error');
            return;
        }

        try {
            // Show loading state
            if (window.showLoading) {
                window.showLoading(xmlOutput);
            }

            const jsonObject = JSON.parse(jsonText);
            const xmlString = this.jsonToXML(jsonObject);
            const formattedXML = this.formatXML(xmlString);
            
            xmlOutput.value = formattedXML;
            this.showAlert('JSON이 XML로 성공적으로 변환되었습니다.', 'success');
            
            if (window.showNotification) {
                window.showNotification('JSON → XML 변환이 완료되었습니다.', 'success');
            }
        } catch (error) {
            console.error('JSON Conversion Error:', error);
            this.showAlert('유효하지 않은 JSON 형식입니다: ' + error.message, 'error');
            
            if (window.showNotification) {
                window.showNotification('JSON 변환 중 오류가 발생했습니다.', 'error');
            }
        } finally {
            // Hide loading state
            if (window.hideLoading) {
                window.hideLoading(xmlOutput);
            }
        }
    }

    jsonToXML(jsonObj, rootName = 'root') {
        let xml = `<${rootName}>`;

        for (let key in jsonObj) {
            if (jsonObj.hasOwnProperty(key)) {
                if (Array.isArray(jsonObj[key])) {
                    jsonObj[key].forEach(item => {
                        xml += this.jsonToXML(item, key);
                    });
                } else if (typeof jsonObj[key] === "object" && jsonObj[key] !== null) {
                    xml += this.jsonToXML(jsonObj[key], key);
                } else {
                    const value = this.escapeXML(String(jsonObj[key]));
                    xml += `<${key}>${value}</${key}>`;
                }
            }
        }

        xml += `</${rootName}>`;
        return xml;
    }

    formatXML(xml) {
        let formatted = '';
        const reg = /(>)(<)(\/*)/g;
        xml = xml.replace(reg, '$1\r\n$2$3');
        let pad = 0;
        
        xml.split('\r\n').forEach((node) => {
            let indent = 0;
            if (node.match(/.+<\/\w[^>]*>$/)) {
                indent = 0;
            } else if (node.match(/^<\/\w/)) {
                if (pad !== 0) {
                    pad -= 1;
                }
            } else if (node.match(/^<\w([^>]*[^\/])?>.*$/)) {
                indent = 1;
            } else {
                indent = 0;
            }

            const padding = new Array(pad + 1).join('  ');
            formatted += padding + node + '\r\n';
            pad += indent;
        });

        return formatted.trim();
    }

    escapeXML(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
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
        const xmlOutput = document.getElementById('xmlOutput');
        if (xmlOutput && xmlOutput.value) {
            navigator.clipboard.writeText(xmlOutput.value).then(() => {
                if (window.showNotification) {
                    window.showNotification('XML이 클립보드에 복사되었습니다.', 'success');
                }
            }).catch(() => {
                // Fallback for older browsers
                xmlOutput.select();
                document.execCommand('copy');
                if (window.showNotification) {
                    window.showNotification('XML이 클립보드에 복사되었습니다.', 'success');
                }
            });
        }
    }

    tryExample() {
        const exampleCode = document.getElementById('exampleJSON');
        const jsonInput = document.getElementById('jsonInput');
        
        if (exampleCode && jsonInput) {
            jsonInput.value = exampleCode.textContent;
            jsonInput.focus();
            this.convertJSONtoXML();
        }
    }
}

// Global functions for backward compatibility
function convertJSONtoXML() {
    if (window.jsonToXMLConverter) {
        window.jsonToXMLConverter.convertJSONtoXML();
    }
}

function copyOutput() {
    if (window.jsonToXMLConverter) {
        window.jsonToXMLConverter.copyOutput();
    }
}

function tryExample() {
    if (window.jsonToXMLConverter) {
        window.jsonToXMLConverter.tryExample();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jsonToXMLConverter = new JSONToXMLConverter();
}); 