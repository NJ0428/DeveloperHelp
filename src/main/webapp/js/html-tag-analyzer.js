// HTML Tag Analyzer - Modernize Style
class HTMLTagAnalyzer {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Ctrl+Enter 키보드 단축키 지원
        const htmlInput = document.getElementById('htmlInput');
        if (htmlInput) {
            htmlInput.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                    this.analyzeHTML();
                }
            });
        }
    }

    analyzeHTML() {
        const htmlInput = document.getElementById('htmlInput');
        const resultsContainer = document.getElementById('analysisResults');
        const tableContainer = document.getElementById('resultsTableContainer');
        const tableBody = document.getElementById('resultsTableBody');

        if (!htmlInput || !resultsContainer || !tableContainer || !tableBody) {
            console.error('Required DOM elements not found');
            return;
        }

        const htmlCode = htmlInput.value.trim();

        if (!htmlCode) {
            if (window.showNotification) {
                window.showNotification('HTML 코드를 입력하세요.', 'warning');
            } else {
                alert('HTML 코드를 입력하세요.');
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
            
            // Parse HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlCode, 'text/html');
            
            // Check for parsing errors
            const parserError = doc.querySelector('parsererror');
            if (parserError) {
                throw new Error('HTML 파싱 오류가 발생했습니다. 올바른 HTML 구문을 확인해주세요.');
            }

            // Analyze elements
            const body = doc.body;
            if (body && body.children.length > 0) {
                this.analyzeElement(body, 0);
                
                // Show success results
                resultsContainer.innerHTML = `
                    <div style="text-align: center; color: var(--success-color); padding: 30px 0;">
                        <i class="fas fa-check-circle" style="font-size: 48px; margin-bottom: 15px;"></i>
                        <p><strong>분석 완료!</strong><br>아래 표에서 상세 결과를 확인하세요.</p>
                        <small style="color: var(--muted-color);">총 ${body.querySelectorAll('*').length}개의 요소가 분석되었습니다.</small>
                    </div>
                `;
                
                tableContainer.style.display = 'block';
                
                if (window.showNotification) {
                    window.showNotification('HTML 분석이 완료되었습니다.', 'success');
                }
            } else {
                throw new Error('유효한 HTML 요소를 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('HTML Analysis Error:', error);
            
            resultsContainer.innerHTML = `
                <div style="text-align: center; color: var(--danger-color); padding: 30px 0;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 15px;"></i>
                    <p><strong>오류 발생:</strong><br>${error.message}</p>
                    <small style="color: var(--muted-color);">HTML 구문을 다시 확인해주세요.</small>
                </div>
            `;
            
            tableContainer.style.display = 'none';
            
            if (window.showNotification) {
                window.showNotification('HTML 분석 중 오류가 발생했습니다.', 'error');
            }
        } finally {
            // Hide loading state
            if (window.hideLoading) {
                window.hideLoading(resultsContainer);
            }
        }
    }

    analyzeElement(element, indentLevel) {
        const tableBody = document.getElementById('resultsTableBody');
        const children = element.children;

        Array.from(children).forEach((child, index) => {
            const uniqueId = `element-${indentLevel}-${index}-${Date.now()}`;
            
            // Create main tag row
            const tagRow = this.createTagRow(child, indentLevel, uniqueId);
            tableBody.appendChild(tagRow);

            // Add additional attribute rows if there are more than one attribute
            if (child.attributes.length > 1) {
                this.createAttributeRows(child, indentLevel, uniqueId).forEach(row => {
                    tableBody.appendChild(row);
                });
            }

            // Recursively analyze child elements
            if (child.children.length > 0) {
                this.analyzeElement(child, indentLevel + 1);
            }
        });
    }

    createTagRow(element, indentLevel, uniqueId) {
        const tagRow = document.createElement('tr');
        tagRow.className = 'collapsible';
        tagRow.dataset.level = indentLevel;
        tagRow.dataset.elementId = uniqueId;

        // Create cells
        const indentCell = document.createElement('td');
        const attributeCell = document.createElement('td');
        const valueCell = document.createElement('td');

        // Setup indent and tag name
        const indent = '  '.repeat(indentLevel);
        const hasMultipleAttributes = element.attributes.length > 1;
        
        indentCell.innerHTML = `
            ${indent}
            ${hasMultipleAttributes ? '<i class="fas fa-caret-right expand-icon"></i>' : '<i class="fas fa-circle" style="font-size: 6px; margin-right: 12px; opacity: 0.3;"></i>'}
            <span class="tag-name">&lt;${element.tagName.toLowerCase()}&gt;</span>
        `;

        // Add click handler for collapsible functionality (only if multiple attributes)
        if (hasMultipleAttributes) {
            tagRow.addEventListener('click', () => this.toggleElementRows(uniqueId));
            tagRow.title = '클릭하여 속성 목록을 펼치거나 접기';
        }

        // Show first attribute or placeholder
        if (element.attributes.length > 0) {
            const firstAttr = element.attributes[0];
            attributeCell.innerHTML = `<span class="attribute-name">${this.escapeHtml(firstAttr.name)}</span>`;
            valueCell.innerHTML = `<span class="attribute-value">"${this.escapeHtml(firstAttr.value)}"</span>`;
        } else {
            attributeCell.innerHTML = '<span style="color: var(--muted-color); font-style: italic;">속성 없음</span>';
            valueCell.innerHTML = '<span style="color: var(--muted-color);">—</span>';
        }

        tagRow.appendChild(indentCell);
        tagRow.appendChild(attributeCell);
        tagRow.appendChild(valueCell);

        return tagRow;
    }

    createAttributeRows(element, indentLevel, parentId) {
        const rows = [];
        const indent = '  '.repeat(indentLevel);

        // Skip first attribute as it's already shown in the main row
        Array.from(element.attributes).slice(1).forEach(attr => {
            const attrRow = document.createElement('tr');
            attrRow.className = 'collapsed-row';
            attrRow.dataset.parentId = parentId;
            attrRow.dataset.level = indentLevel;

            const emptyCell = document.createElement('td');
            emptyCell.innerHTML = `${indent}  <i class="fas fa-arrow-turn-down-right" style="font-size: 12px; color: var(--muted-color); margin-right: 8px;"></i>`;
            
            const attrNameCell = document.createElement('td');
            attrNameCell.innerHTML = `<span class="attribute-name">${this.escapeHtml(attr.name)}</span>`;
            
            const attrValueCell = document.createElement('td');
            attrValueCell.innerHTML = `<span class="attribute-value">"${this.escapeHtml(attr.value)}"</span>`;

            attrRow.appendChild(emptyCell);
            attrRow.appendChild(attrNameCell);
            attrRow.appendChild(attrValueCell);
            
            rows.push(attrRow);
        });

        return rows;
    }

    toggleElementRows(elementId) {
        const parentRow = document.querySelector(`[data-element-id="${elementId}"]`);
        const childRows = document.querySelectorAll(`[data-parent-id="${elementId}"]`);
        const expandIcon = parentRow.querySelector('.expand-icon');
        
        if (!parentRow || !expandIcon) return;
        
        const isExpanded = parentRow.classList.contains('expanded');
        
        if (isExpanded) {
            parentRow.classList.remove('expanded');
            childRows.forEach(row => {
                row.style.display = 'none';
                row.style.opacity = '0';
            });
        } else {
            parentRow.classList.add('expanded');
            childRows.forEach((row, index) => {
                row.style.display = 'table-row';
                // Staggered animation
                setTimeout(() => {
                    row.style.transition = 'opacity 0.3s ease';
                    row.style.opacity = '1';
                }, index * 50);
            });
        }
    }

    tryExample() {
        const exampleCode = document.getElementById('exampleCode');
        const htmlInput = document.getElementById('htmlInput');
        
        if (exampleCode && htmlInput) {
            htmlInput.value = exampleCode.textContent;
            htmlInput.focus();
            this.analyzeHTML();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global functions for backward compatibility
function analyzeHTML() {
    if (window.htmlTagAnalyzer) {
        window.htmlTagAnalyzer.analyzeHTML();
    }
}

function tryExample() {
    if (window.htmlTagAnalyzer) {
        window.htmlTagAnalyzer.tryExample();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.htmlTagAnalyzer = new HTMLTagAnalyzer();
    
    // Add helpful tooltips
    const htmlInput = document.getElementById('htmlInput');
    if (htmlInput) {
        htmlInput.setAttribute('data-tooltip', 'Ctrl+Enter를 눌러 빠르게 분석하세요');
    }
}); 