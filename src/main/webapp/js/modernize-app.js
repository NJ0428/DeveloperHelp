// Modernize App JavaScript
class ModernizeApp {
    constructor() {
        this.sidebarCollapsed = false;
        this.init();
    }

    init() {
        this.initSidebar();
        this.initTheme();
        this.initAnimations();
        this.initTooltips();
    }

    // 사이드바 기능
    initSidebar() {
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');

        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSidebar();
            });
        }

        // 모바일용 오버레이 생성
        this.createSidebarOverlay();

        // 모바일에서 사이드바 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                const overlay = document.querySelector('.sidebar-overlay');
                if (overlay && overlay.classList.contains('show') && 
                    !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                    this.closeSidebar();
                }
            }
        });

        // 현재 페이지 메뉴 항목 활성화
        this.setActiveMenuItem();
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        const overlay = document.querySelector('.sidebar-overlay');

        if (window.innerWidth <= 768) {
            // 모바일: 사이드바 열기/닫기
            sidebar.classList.toggle('open');
            if (overlay) {
                overlay.classList.toggle('show');
            }
        } else {
            // 데스크톱: 사이드바 축소/확장
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('sidebar-collapsed');
        }
        
        this.sidebarCollapsed = !this.sidebarCollapsed;
    }

    closeSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        sidebar.classList.remove('open');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    createSidebarOverlay() {
        // 이미 오버레이가 있으면 생성하지 않음
        if (document.querySelector('.sidebar-overlay')) {
            return;
        }

        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.addEventListener('click', () => {
            this.closeSidebar();
        });
        
        document.body.appendChild(overlay);
    }

    setActiveMenuItem() {
        const currentPage = window.location.pathname.split('/').pop();
        const menuLinks = document.querySelectorAll('.sidebar-menu a');
        
        menuLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }

    // 테마 기능
    initTheme() {
        const themeToggle = document.querySelector('.theme-toggle');
        const savedTheme = localStorage.getItem('theme') || 'light';
        
        this.setTheme(savedTheme);

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.body.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                this.setTheme(newTheme);
                localStorage.setItem('theme', newTheme);
            });
        }
    }

    setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        const themeIcon = document.querySelector('.theme-toggle i');
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // 애니메이션 효과
    initAnimations() {
        // 카드 호버 효과
        const cards = document.querySelectorAll('.card, .tool-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-2px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });

        // 페이지 로드 애니메이션
        this.animateOnLoad();
    }

    animateOnLoad() {
        const elements = document.querySelectorAll('.card, .tool-card');
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.5s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    // 툴팁 기능
    initTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target);
            });
            
            element.addEventListener('mouseleave', (e) => {
                this.hideTooltip();
            });
        });
    }

    showTooltip(element) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = element.getAttribute('data-tooltip');
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
        
        setTimeout(() => tooltip.classList.add('show'), 10);
    }

    hideTooltip() {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    // 유틸리티 함수들
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        
        // 자동 제거
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // 수동 제거
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // 로딩 스피너
    showLoading(element) {
        const loader = document.createElement('div');
        loader.className = 'loading-spinner';
        loader.innerHTML = '<div class="spinner"></div>';
        element.appendChild(loader);
    }

    hideLoading(element) {
        const loader = element.querySelector('.loading-spinner');
        if (loader) {
            loader.remove();
        }
    }
}

// 페이지 로드 시 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.modernizeApp = new ModernizeApp();
});

// 전역 유틸리티 함수들
window.showNotification = (message, type) => {
    if (window.modernizeApp) {
        window.modernizeApp.showNotification(message, type);
    }
};

window.showLoading = (element) => {
    if (window.modernizeApp) {
        window.modernizeApp.showLoading(element);
    }
};

window.hideLoading = (element) => {
    if (window.modernizeApp) {
        window.modernizeApp.hideLoading(element);
    }
};

window.toggleSidebar = () => {
    if (window.modernizeApp) {
        window.modernizeApp.toggleSidebar();
    }
};