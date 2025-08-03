/**
 * ========================================
 * mmingプログラミング教室 - メインJavaScript
 * ========================================
 * 
 * ファイル目的:
 * - サイト全体のインタラクティブ機能を統合管理
 * - シンプルで確実な動作を重視（ES6モジュール不使用）
 * - 全ブラウザ対応・iPhone最適化済み
 * 
 * 主要機能:
 * 1. モバイルナビゲーション（ハンバーガーメニュー）
 * 2. 画像遅延読み込み（パフォーマンス最適化）
 * 3. スムーススクロール（UX向上）
 * 4. アクセシビリティ機能（スクリーンリーダー対応）
 * 5. 外部リンク管理（新規タブ開機能）
 * 
 * 設計方針:
 * - 即座に実行される無名関数でスコープ分離
 * - エラーハンドリング重視
 * - DOM操作前の要素存在チェック必須
 * - アクセシビリティ配慮
 * 
 * 2024年12月リファクタリング完了
 * ========================================
 */

(function() {
    'use strict';
    
    // ========================================
    // WebP対応検出とCSS適用
    // ========================================
    
    function detectWebP() {
        const webpElement = document.createElement('canvas');
        const webpSupported = webpElement.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        
        if (webpSupported) {
            document.documentElement.classList.add('webp');
        } else {
            document.documentElement.classList.add('no-webp');
        }
    }
    
    // ========================================
    // モバイルナビゲーション管理
    // ========================================
    
    function initializeNavigation() {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        let mobileMenuOpen = false;
        
        if (!menuToggle || !navMenu) return;
        
        // モバイルメニュートグル
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            toggleMobileMenu();
        });
        
        // メニュー項目クリック時にメニューを閉じる
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                if (window.innerWidth < 768) {
                    closeMobileMenu();
                }
            });
        });
        
        // 外部クリック時にメニューを閉じる
        document.addEventListener('click', function(e) {
            if (mobileMenuOpen && 
                !menuToggle.contains(e.target) && 
                !navMenu.contains(e.target)) {
                closeMobileMenu();
            }
        });
        
        // ESCキーでメニューを閉じる
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenuOpen) {
                closeMobileMenu();
            }
        });
        
        // リサイズ時の処理
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 768 && mobileMenuOpen) {
                closeMobileMenu();
            }
        });
        
        function toggleMobileMenu() {
            if (mobileMenuOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        }
        
        function openMobileMenu() {
            mobileMenuOpen = true;
            menuToggle.setAttribute('aria-expanded', 'true');
            navMenu.classList.add('active');
            navMenu.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
        
        function closeMobileMenu() {
            mobileMenuOpen = false;
            menuToggle.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
            navMenu.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            menuToggle.focus();
        }
        
        // スムーズスクロール
        const scrollLinks = document.querySelectorAll('a[href^="#"]');
        scrollLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                const href = link.getAttribute('href');
                if (href === '#' || href === '#top') return;
                
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    // ========================================
    // 画像遅延読み込み
    // ========================================
    
    function initializeLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            });
            
            images.forEach(function(img) {
                imageObserver.observe(img);
            });
        } else {
            // フォールバック: 全ての画像を即座に読み込み
            images.forEach(function(img) {
                img.classList.add('loaded');
            });
        }
    }
    
    // ========================================
    // アクセシビリティ強化
    // ========================================
    
    function initializeAccessibility() {
        // フォーカス可視化の改善
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                document.body.classList.add('using-keyboard');
            }
        });
        
        document.addEventListener('mousedown', function() {
            document.body.classList.remove('using-keyboard');
        });
        
        // 動きの軽減設定への対応
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--animation-duration', '0s');
        }
    }
    
    // ========================================
    // 初期化処理
    // ========================================
    
    function initializeApp() {
        detectWebP();              // WebP対応検出
        initializeNavigation();
        initializeLazyLoading();
        initializeAccessibility();
        
        // パフォーマンス測定
        if (window.mmingPerf) {
            window.mmingPerf.jsInitTime = performance.now() - window.mmingPerf.start;
            console.log('JavaScript initialization time:', window.mmingPerf.jsInitTime + 'ms');
        }
        
        console.log('mming プログラミング教室サイト初期化完了');
    }
    
    // DOM読み込み完了時に実行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
    
})();