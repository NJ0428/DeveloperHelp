// HTTP Header Parser - Modernize Style
class HTTPHeaderParser {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Ctrl+Enter 키보드 단축키 지원
        const headerInput = document.getElementById('headerInput');
        if (headerInput) {
            headerInput.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                    this.parseHeaders();
                }
            });
        }
    }

    parseHeaders() {
        const headerInput = document.getElementById('headerInput');
        const resultsContainer = document.getElementById('parseResults');
        const tableContainer = document.getElementById('resultsTableContainer');
        const tableBody = document.getElementById('headerTableBody');

        if (!headerInput || !resultsContainer || !tableContainer || !tableBody) {
            console.error('Required DOM elements not found');
            return;
        }

        const headerText = headerInput.value.trim();

        if (!headerText) {
            if (window.showNotification) {
                window.showNotification('HTTP 헤더를 입력하세요.', 'warning');
            } else {
                alert('HTTP 헤더를 입력하세요.');
            }
            return;
        }

        try {
            // Show loading state
            if (window.showLoading) {
                window.showLoading(resultsContainer);
            }

            // Clear previous results
            tableBody.innerHTML = '';

            // Parse headers
            const headers = this.parseHeaderText(headerText);

            if (headers.length > 0) {
                // Populate table
                headers.forEach(header => {
                    const row = document.createElement('tr');
                    
                    const keyCell = document.createElement('td');
                    keyCell.innerHTML = `<span class="header-key">${this.escapeHtml(header.key)}</span>`;
                    
                    const valueCell = document.createElement('td');
                    valueCell.innerHTML = `<span class="header-value">${this.escapeHtml(header.value)}</span>`;

                    row.appendChild(keyCell);
                    row.appendChild(valueCell);
                    tableBody.appendChild(row);
                });

                // Show success results
                resultsContainer.innerHTML = `
                    <div style="text-align: center; color: var(--success-color); padding: 30px 0;">
                        <i class="fas fa-check-circle" style="font-size: 48px; margin-bottom: 15px;"></i>
                        <p><strong>파싱 완료!</strong><br>아래 표에서 상세 결과를 확인하세요.</p>
                        <small style="color: var(--muted-color);">총 ${headers.length}개의 헤더가 파싱되었습니다.</small>
                    </div>
                `;
                
                tableContainer.style.display = 'block';
                
                if (window.showNotification) {
                    window.showNotification('HTTP 헤더 파싱이 완료되었습니다.', 'success');
                }
            } else {
                throw new Error('유효한 HTTP 헤더가 없습니다.');
            }
        } catch (error) {
            console.error('Header Parsing Error:', error);
            
            resultsContainer.innerHTML = `
                <div style="text-align: center; color: var(--danger-color); padding: 30px 0;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 15px;"></i>
                    <p><strong>오류 발생:</strong><br>${error.message}</p>
                    <small style="color: var(--muted-color);">헤더 형식을 다시 확인해주세요.</small>
                </div>
            `;
            
            tableContainer.style.display = 'none';
            
            if (window.showNotification) {
                window.showNotification('헤더 파싱 중 오류가 발생했습니다.', 'error');
            }
        } finally {
            // Hide loading state
            if (window.hideLoading) {
                window.hideLoading(resultsContainer);
            }
        }
    }

    parseHeaderText(headerText) {
        const lines = headerText.split('\n');
        const headers = [];

        lines.forEach((line, index) => {
            line = line.trim();
            if (!line) return;

            // Skip HTTP status line (first line starting with HTTP/)
            if (index === 0 && line.startsWith('HTTP/')) return;

            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                const key = line.substring(0, colonIndex).trim();
                const value = line.substring(colonIndex + 1).trim();
                
                if (key && value) {
                    headers.push({ key, value });
                }
            }
        });

        return headers;
    }

    tryExample() {
        const exampleHeaders = document.getElementById('exampleHeaders');
        const headerInput = document.getElementById('headerInput');
        
        if (exampleHeaders && headerInput) {
            headerInput.value = exampleHeaders.textContent;
            headerInput.focus();
            this.parseHeaders();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global functions for backward compatibility
function parseHeaders() {
    if (window.httpHeaderParser) {
        window.httpHeaderParser.parseHeaders();
    }
}

function tryExample() {
    if (window.httpHeaderParser) {
        window.httpHeaderParser.tryExample();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.httpHeaderParser = new HTTPHeaderParser();
    
    // Add helpful tooltips
    const headerInput = document.getElementById('headerInput');
    if (headerInput) {
        headerInput.setAttribute('data-tooltip', 'Ctrl+Enter를 눌러 빠르게 파싱하세요');
    }
}); 