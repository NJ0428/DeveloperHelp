// Variable Suggester - Modernize Style
class VariableSuggester {
    constructor() {
        this.builtInSuggestions = {
            '사용자': ['user', 'member', 'customer', 'account', 'person'],
            '데이터': ['data', 'info', 'information', 'record', 'dataset'],
            '목록': ['list', 'array', 'items', 'collection', 'records'],
            '상태': ['status', 'state', 'condition', 'flag', 'mode'],
            '번호': ['number', 'id', 'index', 'count', 'sequence'],
            '이름': ['name', 'title', 'label', 'identifier', 'key'],
            '시간': ['time', 'date', 'timestamp', 'duration', 'period'],
            '크기': ['size', 'length', 'width', 'height', 'dimension'],
            '값': ['value', 'amount', 'price', 'cost', 'total'],
            '파일': ['file', 'document', 'attachment', 'media', 'resource'],
            '경로': ['path', 'route', 'url', 'location', 'address'],
            '설정': ['config', 'setting', 'option', 'preference', 'parameter'],
            '결과': ['result', 'output', 'response', 'outcome', 'answer'],
            '입력': ['input', 'param', 'argument', 'request', 'query'],
            '메시지': ['message', 'text', 'content', 'description', 'comment'],
            '이미지': ['image', 'picture', 'photo', 'thumbnail', 'icon'],
            '버튼': ['button', 'btn', 'control', 'action', 'trigger'],
            '색상': ['color', 'theme', 'style', 'appearance', 'skin'],
            '위치': ['position', 'location', 'coordinate', 'offset', 'point'],
            '속도': ['speed', 'velocity', 'rate', 'pace', 'frequency']
        };
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const wordInput = document.getElementById('inputWord');
        if (wordInput) {
            wordInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.generateSuggestions();
                }
            });
        }
    }

    async generateSuggestions() {
        const inputWord = document.getElementById('inputWord');
        const suggestionsContainer = document.getElementById('suggestions');
        
        if (!inputWord || !suggestionsContainer) return;

        const word = inputWord.value.trim();
        
        if (!word) {
            this.showError('한글 단어를 입력해주세요.');
            return;
        }

        this.showLoading();

        try {
            const suggestions = this.getBuiltInSuggestions(word);
            this.displaySuggestions(suggestions, word);
        } catch (error) {
            console.error('Error generating suggestions:', error);
            this.showError('변수명 생성 중 오류가 발생했습니다.');
        }
    }

    getBuiltInSuggestions(word) {
        const suggestions = [];
        
        if (this.builtInSuggestions[word]) {
            suggestions.push(...this.builtInSuggestions[word]);
        }
        
        Object.keys(this.builtInSuggestions).forEach(key => {
            if (key.includes(word) || word.includes(key)) {
                suggestions.push(...this.builtInSuggestions[key]);
            }
        });
        
        const baseWords = [...new Set(suggestions)];
        const variations = [];
        
        baseWords.forEach(base => {
            variations.push(base);
            variations.push(base + 'List');
            variations.push(base + 'Data');
            variations.push(base + 'Info');
            variations.push('current' + this.capitalize(base));
            variations.push('selected' + this.capitalize(base));
        });
        
        return [...new Set(variations)].slice(0, 15);
    }

    displaySuggestions(suggestions, originalWord) {
        const container = document.getElementById('suggestions');
        if (!container) return;

        if (suggestions.length === 0) {
            this.showError('해당 단어에 대한 변수명을 찾을 수 없습니다.');
            return;
        }

        let html = `
            <div class="suggestion-count">
                <i class="fas fa-lightbulb"></i>
                "${originalWord}"에 대한 ${suggestions.length}개의 변수명 추천
            </div>
            <table class="suggestions-table">
                <thead>
                    <tr>
                        <th>추천 변수명</th>
                        <th>동작</th>
                    </tr>
                </thead>
                <tbody>
        `;

        suggestions.forEach(suggestion => {
            html += `
                <tr>
                    <td>
                        <span class="variable-name" onclick="copyToClipboard('${suggestion}')">${suggestion}</span>
                    </td>
                    <td>
                        <button class="copy-btn" onclick="copyToClipboard('${suggestion}')" title="복사">
                            <i class="fas fa-copy"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
        
        if (window.showNotification) {
            window.showNotification(`${suggestions.length}개의 변수명이 생성되었습니다.`, 'success');
        }
    }

    showLoading() {
        const container = document.getElementById('suggestions');
        if (container) {
            container.innerHTML = `
                <div class="suggestions-loading">
                    <i class="fas fa-spinner"></i>
                    <p>변수명을 생성하고 있습니다...</p>
                </div>
            `;
        }
    }

    showError(message) {
        const container = document.getElementById('suggestions');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${message}</p>
                </div>
            `;
        }
        
        if (window.showNotification) {
            window.showNotification(message, 'error');
        }
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

function generateSuggestions() {
    if (window.variableSuggester) {
        window.variableSuggester.generateSuggestions();
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        if (window.showNotification) {
            window.showNotification(`"${text}"가 클립보드에 복사되었습니다.`, 'success');
        }
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (window.showNotification) {
            window.showNotification(`"${text}"가 클립보드에 복사되었습니다.`, 'success');
        }
    });
}

function tryExample(word) {
    const inputWord = document.getElementById('inputWord');
    if (inputWord) {
        inputWord.value = word;
        generateSuggestions();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.variableSuggester = new VariableSuggester();
}); 