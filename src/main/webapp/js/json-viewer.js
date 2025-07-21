// JSON Viewer - Modernize Style
class JSONViewer {
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
                    this.parseJSON();
                }
            });
        }
    }

    parseJSON() {
        const jsonInput = document.getElementById('jsonInput');
        const jsonTable = document.getElementById('jsonTable');
        const alertDiv = document.getElementById('alert');
        const resultsContainer = document.getElementById('parseResults');

        if (!jsonInput || !jsonTable || !alertDiv || !resultsContainer) {
            console.error('Required DOM elements not found');
            return;
        }

        const jsonText = jsonInput.value.trim();

        // Clear previous results
        jsonTable.innerHTML = '';
        this.hideAlert();

        if (!jsonText) {
            this.showAlert('JSON 데이터를 입력하세요.', 'error');
            this.showEmptyState(resultsContainer);
            return;
        }

        try {
            // Show loading state
            if (window.showLoading) {
                window.showLoading(resultsContainer);
            }

            const jsonObject = JSON.parse(jsonText);
            this.generateTable(jsonObject, jsonTable);
            
            // Show success state
            resultsContainer.innerHTML = `
                <div style="text-align: center; color: var(--success-color); padding: 30px 0;">
                    <i class="fas fa-check-circle" style="font-size: 48px; margin-bottom: 15px;"></i>
                    <p><strong>JSON 파싱 완료!</strong><br>아래 표에서 구조화된 데이터를 확인하세요.</p>
                </div>
            `;
            
            this.showAlert('JSON이 성공적으로 파싱되었습니다.', 'success');
            
            if (window.showNotification) {
                window.showNotification('JSON 파싱이 완료되었습니다.', 'success');
            }
        } catch (error) {
            console.error('JSON Parsing Error:', error);
            this.showAlert('유효하지 않은 JSON 형식입니다: ' + error.message, 'error');
            this.showEmptyState(resultsContainer);
            
            if (window.showNotification) {
                window.showNotification('JSON 파싱 중 오류가 발생했습니다.', 'error');
            }
        } finally {
            // Hide loading state
            if (window.hideLoading) {
                window.hideLoading(resultsContainer);
            }
        }
    }

    showEmptyState(container) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--muted-color); padding: 50px 0;">
                <i class="fas fa-info-circle" style="font-size: 48px; margin-bottom: 15px;"></i>
                <p>JSON 데이터를 입력하고 파싱 버튼을 클릭하세요.</p>
            </div>
        `;
    }

    generateTable(jsonObj, container) {
        if (typeof jsonObj === 'object' && !Array.isArray(jsonObj) && jsonObj !== null) {
            const table = document.createElement('table');
            table.className = 'results-table';

            const header = table.insertRow(-1);
            const thKey = document.createElement('th');
            thKey.innerHTML = '<i class="fas fa-key"></i> 키';
            const thValue = document.createElement('th');
            thValue.innerHTML = '<i class="fas fa-file-alt"></i> 값';
            const thType = document.createElement('th');
            thType.innerHTML = '<i class="fas fa-info-circle"></i> 타입';
            
            header.appendChild(thKey);
            header.appendChild(thValue);
            header.appendChild(thType);

            for (const key in jsonObj) {
                if (jsonObj.hasOwnProperty(key)) {
                    const row = table.insertRow(-1);
                    const cellKey = row.insertCell(-1);
                    const cellValue = row.insertCell(-1);
                    const cellType = row.insertCell(-1);

                    cellKey.innerHTML = `<span class="json-key">${this.escapeHtml(key)}</span>`;

                    const value = jsonObj[key];
                    const valueType = this.getValueType(value);
                    
                    cellType.innerHTML = `<span class="json-type">${valueType}</span>`;

                    if (Array.isArray(value)) {
                        const collapsibleDiv = this.createCollapsibleDiv(value, 'array');
                        cellValue.appendChild(collapsibleDiv);
                    } else if (typeof value === 'object' && value !== null) {
                        const nestedContainer = document.createElement('div');
                        nestedContainer.className = 'nested-container';
                        this.generateTable(value, nestedContainer);
                        
                        const collapsibleDiv = this.createCollapsibleDiv(nestedContainer, 'object');
                        cellValue.appendChild(collapsibleDiv);
                    } else {
                        cellValue.innerHTML = `<span class="json-value json-${valueType}">${this.escapeHtml(String(value))}</span>`;
                    }
                }
            }

            container.appendChild(table);
        } else {
            container.innerHTML = `
                <div class="alert-message alert-error" style="display: block;">
                    루트 요소는 객체여야 합니다.
                </div>
            `;
        }
    }

    createCollapsibleDiv(content, type) {
        const div = document.createElement('div');
        div.className = 'collapsible-container';
        
        const collapsible = document.createElement('span');
        collapsible.className = 'collapsible';
        
        if (type === 'array') {
            collapsible.innerHTML = `<i class="fas fa-caret-right expand-icon"></i> Array (${content.length} items)`;
        } else {
            collapsible.innerHTML = `<i class="fas fa-caret-right expand-icon"></i> Object`;
        }
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'content';

        if (type === 'array') {
            content.forEach((item, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'array-item';
                itemDiv.innerHTML = `<strong>Item ${index + 1}:</strong> `;

                if (typeof item === 'object' && item !== null) {
                    const nestedContainer = document.createElement('div');
                    nestedContainer.className = 'nested-container';
                    this.generateTable(item, nestedContainer);
                    itemDiv.appendChild(nestedContainer);
                } else {
                    const valueType = this.getValueType(item);
                    itemDiv.innerHTML += `<span class="json-value json-${valueType}">${this.escapeHtml(String(item))}</span>`;
                }

                contentDiv.appendChild(itemDiv);
            });
        } else {
            contentDiv.appendChild(content);
        }

        collapsible.onclick = () => {
            const isExpanded = div.classList.contains('expanded');
            if (isExpanded) {
                div.classList.remove('expanded');
                contentDiv.style.display = 'none';
                collapsible.querySelector('.expand-icon').style.transform = 'rotate(0deg)';
            } else {
                div.classList.add('expanded');
                contentDiv.style.display = 'block';
                collapsible.querySelector('.expand-icon').style.transform = 'rotate(90deg)';
            }
        };

        div.appendChild(collapsible);
        div.appendChild(contentDiv);

        return div;
    }

    getValueType(value) {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        if (typeof value === 'boolean') return 'boolean';
        if (typeof value === 'number') return 'number';
        if (typeof value === 'string') return 'string';
        if (typeof value === 'object') return 'object';
        return 'unknown';
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

    tryExample() {
        const exampleCode = document.getElementById('exampleJSON');
        const jsonInput = document.getElementById('jsonInput');
        
        if (exampleCode && jsonInput) {
            jsonInput.value = exampleCode.textContent;
            jsonInput.focus();
            this.parseJSON();
        }
    }

    clearInput() {
        const jsonInput = document.getElementById('jsonInput');
        const jsonTable = document.getElementById('jsonTable');
        const resultsContainer = document.getElementById('parseResults');
        
        if (jsonInput) jsonInput.value = '';
        if (jsonTable) jsonTable.innerHTML = '';
        if (resultsContainer) this.showEmptyState(resultsContainer);
        
        this.hideAlert();
        
        if (window.showNotification) {
            window.showNotification('입력이 초기화되었습니다.', 'info');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global functions for backward compatibility
function parseJSON() {
    if (window.jsonViewer) {
        window.jsonViewer.parseJSON();
    }
}

function tryExample() {
    if (window.jsonViewer) {
        window.jsonViewer.tryExample();
    }
}

function clearInput() {
    if (window.jsonViewer) {
        window.jsonViewer.clearInput();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jsonViewer = new JSONViewer();
}); 