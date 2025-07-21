// Lunch Recommender - Modernize Style
class LunchRecommender {
    constructor() {
        this.lunchHistory = JSON.parse(localStorage.getItem('lunchHistory')) || [];
        this.lunchOptions = [
            '새우볶음밥', '롯데리아', '돈까스', '제육볶음', '된장찌개',
            '불고기', '냉면', '순두부찌개', '카레라이스', '짜장면',
            '짬뽕', '라면', '김밥', '우동', '떡볶이',
            '치킨', '피자', '햄버거', '샌드위치', '파스타',
            '비빔밥', '찜닭', '갈비탕', '삼계탕', '칼국수',
            '김치찌개', '부대찌개', '청국장', '고등어구이', '제육덮밥'
        ];
        this.init();
    }

    init() {
        this.loadHistory();
        this.updateStats();
        this.bindEvents();
    }

    bindEvents() {
        // Enter key support for restaurant input
        const restaurantInput = document.getElementById('restaurantInput');
        if (restaurantInput) {
            restaurantInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.saveLunch();
                }
            });
        }
    }

    recommendLunch() {
        const weights = this.calculateWeights(this.lunchOptions);
        const recommendation = this.weightedRandomSelect(this.lunchOptions, weights);
        
        // Update recommendation display
        const recommendationText = document.getElementById('recommendationText');
        const recommendationSubtitle = document.getElementById('recommendationSubtitle');
        
        if (recommendationText) {
            recommendationText.textContent = recommendation;
            
            // Add animation effect
            recommendationText.style.animation = 'none';
            recommendationText.offsetHeight; // Trigger reflow
            recommendationText.style.animation = 'fadeInScale 0.6s ease-out';
        }
        
        if (recommendationSubtitle) {
            recommendationSubtitle.textContent = '맛있게 드세요! 🍽️';
        }

        // Show notification
        if (window.showNotification) {
            window.showNotification(`오늘의 점심 추천: ${recommendation}`, 'success');
        }
    }

    calculateWeights(options) {
        return options.map(option => {
            // Count recent selections (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const recentCount = this.lunchHistory.filter(entry => {
                const entryDate = new Date(entry.date);
                return entry.food === option && entryDate >= thirtyDaysAgo;
            }).length;
            
            // Base weight minus recent selections (more recent = lower weight)
            return Math.max(1, 10 - recentCount * 2);
        });
    }

    weightedRandomSelect(options, weights) {
        const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < options.length; i++) {
            if (random < weights[i]) {
                return options[i];
            }
            random -= weights[i];
        }
        
        // Fallback
        return options[Math.floor(Math.random() * options.length)];
    }

    saveLunch() {
        const recommendationText = document.getElementById('recommendationText');
        const restaurantInput = document.getElementById('restaurantInput');
        
        if (!recommendationText || !restaurantInput) {
            console.error('Required DOM elements not found');
            return;
        }

        const recommendation = recommendationText.textContent.trim();
        const restaurant = restaurantInput.value.trim();

        if (!recommendation || recommendation === '어떤 음식을 드시고 싶으신가요?') {
            if (window.showNotification) {
                window.showNotification('먼저 점심을 추천받으세요.', 'warning');
            }
            return;
        }

        if (!restaurant) {
            if (window.showNotification) {
                window.showNotification('음식점 이름을 입력하세요.', 'warning');
            }
            restaurantInput.focus();
            return;
        }

        const now = new Date();
        const date = now.toLocaleDateString('ko-KR');
        const day = now.toLocaleDateString('ko-KR', { weekday: 'long' });

        const newEntry = { 
            date, 
            day, 
            food: recommendation, 
            restaurant,
            timestamp: now.getTime()
        };

        this.lunchHistory.unshift(newEntry); // Add to beginning
        this.saveLunchHistory();
        this.loadHistory();
        this.updateStats();
        
        // Clear input
        restaurantInput.value = '';
        
        if (window.showNotification) {
            window.showNotification('점심 기록이 저장되었습니다.', 'success');
        }
    }

    updateLunch(index) {
        const foodInput = document.getElementById(`food-${index}`);
        const restaurantInput = document.getElementById(`restaurant-${index}`);
        
        if (!foodInput || !restaurantInput) return;

        const updatedEntry = {
            ...this.lunchHistory[index],
            food: foodInput.value.trim(),
            restaurant: restaurantInput.value.trim()
        };

        if (!updatedEntry.food || !updatedEntry.restaurant) {
            if (window.showNotification) {
                window.showNotification('음식과 음식점 이름을 모두 입력하세요.', 'warning');
            }
            return;
        }

        this.lunchHistory[index] = updatedEntry;
        this.saveLunchHistory();
        this.loadHistory();
        this.updateStats();
        
        if (window.showNotification) {
            window.showNotification('점심 기록이 수정되었습니다.', 'success');
        }
    }

    deleteLunch(index) {
        if (confirm('이 기록을 삭제하시겠습니까?')) {
            this.lunchHistory.splice(index, 1);
            this.saveLunchHistory();
            this.loadHistory();
            this.updateStats();
            
            if (window.showNotification) {
                window.showNotification('점심 기록이 삭제되었습니다.', 'info');
            }
        }
    }

    loadHistory() {
        const tableBody = document.getElementById('historyTableBody');
        if (!tableBody) return;

        if (this.lunchHistory.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-utensils"></i>
                        <p>아직 점심 기록이 없습니다.<br>점심을 추천받고 기록을 남겨보세요!</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = '';
        
        this.lunchHistory.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${entry.date}</strong></td>
                <td><span class="badge">${entry.day}</span></td>
                <td><input type="text" value="${entry.food}" id="food-${index}" class="inline-input"></td>
                <td><input type="text" value="${entry.restaurant}" id="restaurant-${index}" class="inline-input"></td>
                <td><button onclick="lunchRecommender.updateLunch(${index})" class="action-btn" title="수정"><i class="fas fa-edit"></i></button></td>
                <td><button onclick="lunchRecommender.deleteLunch(${index})" class="action-btn delete-btn" title="삭제"><i class="fas fa-trash"></i></button></td>
            `;
            tableBody.appendChild(row);
        });
    }

    updateStats() {
        const totalCount = document.getElementById('totalCount');
        const weekCount = document.getElementById('weekCount');
        const favoriteFood = document.getElementById('favoriteFood');
        
        if (totalCount) {
            totalCount.textContent = this.lunchHistory.length;
        }
        
        if (weekCount) {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            const weeklyCount = this.lunchHistory.filter(entry => {
                const entryDate = new Date(entry.date);
                return entryDate >= weekAgo;
            }).length;
            
            weekCount.textContent = weeklyCount;
        }
        
        if (favoriteFood) {
            const foodCounts = {};
            this.lunchHistory.forEach(entry => {
                foodCounts[entry.food] = (foodCounts[entry.food] || 0) + 1;
            });
            
            const favorite = Object.keys(foodCounts).reduce((a, b) => 
                foodCounts[a] > foodCounts[b] ? a : b, '없음'
            );
            
            favoriteFood.textContent = favorite;
        }
    }

    saveLunchHistory() {
        localStorage.setItem('lunchHistory', JSON.stringify(this.lunchHistory));
    }

    exportHistory() {
        if (this.lunchHistory.length === 0) {
            if (window.showNotification) {
                window.showNotification('내보낼 데이터가 없습니다.', 'warning');
            }
            return;
        }

        const csvContent = [
            ['날짜', '요일', '음식', '음식점'].join(','),
            ...this.lunchHistory.map(entry => 
                [entry.date, entry.day, entry.food, entry.restaurant].join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `lunch-history-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        if (window.showNotification) {
            window.showNotification('점심 기록이 CSV 파일로 내보내졌습니다.', 'success');
        }
    }

    clearAllHistory() {
        if (confirm('모든 점심 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            this.lunchHistory = [];
            this.saveLunchHistory();
            this.loadHistory();
            this.updateStats();
            
            if (window.showNotification) {
                window.showNotification('모든 점심 기록이 삭제되었습니다.', 'info');
            }
        }
    }
}

// Global functions for backward compatibility
function recommendLunch() {
    if (window.lunchRecommender) {
        window.lunchRecommender.recommendLunch();
    }
}

function saveLunch() {
    if (window.lunchRecommender) {
        window.lunchRecommender.saveLunch();
    }
}

function updateLunch(index) {
    if (window.lunchRecommender) {
        window.lunchRecommender.updateLunch(index);
    }
}

function deleteLunch(index) {
    if (window.lunchRecommender) {
        window.lunchRecommender.deleteLunch(index);
    }
}

function exportHistory() {
    if (window.lunchRecommender) {
        window.lunchRecommender.exportHistory();
    }
}

function clearAllHistory() {
    if (window.lunchRecommender) {
        window.lunchRecommender.clearAllHistory();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.lunchRecommender = new LunchRecommender();
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInScale {
            0% {
                opacity: 0;
                transform: scale(0.8);
            }
            100% {
                opacity: 1;
                transform: scale(1);
            }
        }
        
        .inline-input {
            border: 1px solid transparent !important;
            background: transparent !important;
            padding: 4px 8px !important;
            font-size: 13px !important;
        }
        
        .inline-input:focus {
            border: 1px solid #5d87ff !important;
            background: white !important;
        }
        
        .badge {
            background: #e3f2fd;
            color: #1976d2;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
    `;
    document.head.appendChild(style);
}); 