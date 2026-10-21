/**
 * ========================================
 * mmingプログラミング教室 - 全ページ共通の基盤JavaScript
 * ========================================
 *
 * ファイル目的:
 * - 全ページで必要な最小限のインタラクション
 * - セクション固有の振る舞いは assets/js/sections.js が担当
 *
 * 主要機能:
 * 1. モバイルナビゲーション（ハンバーガーメニュー）
 * 2. 動きの軽減設定への対応
 *
 * 設計方針:
 * - ES6モジュールは使わない。単一のIIFEで囲み、defer で読み込む
 * - DOM操作前の要素存在チェック必須
 * - ブラウザのネイティブ挙動を奪わない
 *   （スムーススクロールは CSS の scroll-behavior に任せる。JS で
 *    preventDefault + scrollIntoView するとフラグメントも履歴もフォーカスも
 *    移動しなくなる）
 * ========================================
 */

(function () {
    'use strict';

    // ========================================
    // モバイルナビゲーション管理
    // ========================================

    function initializeNavigation() {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        if (!menuToggle || !navMenu) return;

        let mobileMenuOpen = false;

        // CSS と閾値を一致させる（768px ちょうどで CSS と JS が食い違わないように）
        const mobileQuery = window.matchMedia('(max-width: 767.98px)');

        function setLabel() {
            const label = mobileMenuOpen
                ? menuToggle.dataset.labelClose
                : menuToggle.dataset.labelOpen;
            if (label) menuToggle.setAttribute('aria-label', label);
        }

        function openMobileMenu() {
            mobileMenuOpen = true;
            menuToggle.setAttribute('aria-expanded', 'true');
            navMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
            setLabel();
        }

        // aria-hidden は操作しない。CSS が visibility: hidden で隠すので
        // アクセシビリティツリーからは自動的に外れる。JS で付けると
        // リサイズでデスクトップ幅になったときに aria-hidden="true" が残り、
        // 見えているナビ全体が支援技術から消えてしまう
        function closeMobileMenu(returnFocus) {
            mobileMenuOpen = false;
            menuToggle.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
            setLabel();

            // フォーカスを戻すのは、トグル自身の操作か Escape で閉じた場合のみ。
            // 無条件に戻すと、ナビリンクを押して閉じたときもフォーカスが
            // ハンバーガーボタンへ飛んでしまう
            if (returnFocus) menuToggle.focus();
        }

        menuToggle.addEventListener('click', function (e) {
            e.preventDefault();
            if (mobileMenuOpen) {
                closeMobileMenu(true);
            } else {
                openMobileMenu();
            }
        });

        // メニュー項目クリック時は閉じる（フォーカスは移動先に任せる）
        navMenu.addEventListener('click', function (e) {
            if (e.target.closest('a') && mobileMenuOpen) {
                closeMobileMenu(false);
            }
        });

        // 外部クリックで閉じる
        document.addEventListener('click', function (e) {
            if (!mobileMenuOpen) return;
            if (menuToggle.contains(e.target) || navMenu.contains(e.target)) return;
            closeMobileMenu(false);
        });

        // Escape で閉じる
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mobileMenuOpen) {
                closeMobileMenu(true);
            }
        });

        // デスクトップ幅になったら閉じる
        function handleBreakpoint() {
            if (!mobileQuery.matches && mobileMenuOpen) {
                closeMobileMenu(false);
            }
        }
        if (typeof mobileQuery.addEventListener === 'function') {
            mobileQuery.addEventListener('change', handleBreakpoint);
        } else if (typeof mobileQuery.addListener === 'function') {
            // 古い Safari 向けフォールバック
            mobileQuery.addListener(handleBreakpoint);
        }

        setLabel();
    }

    // ========================================
    // 初期化処理
    // ========================================

    function initializeApp() {
        initializeNavigation();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
})();
