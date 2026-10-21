/**
 * ========================================
 * mmingプログラミング教室 - セクション別の振る舞い
 * ========================================
 *
 * ファイル目的:
 * - 各セクション固有のインタラクション（アコーディオン、スライダー、フォーム）
 * - simple-main.js（全ページ共通の基盤）とは責務を分離
 *
 * 設計方針:
 * - ES6モジュールは使わない。単一のIIFEで囲み、defer で読み込む
 * - 各 init 関数は「対象要素が無ければ即 return」で始める。
 *   トップページ用のコードが体験ページで走っても何も起きない
 * - 表示状態の真実は aria 属性に1つだけ置く。CSS が属性セレクタで
 *   display を決めるので、JS は style.display を触らない
 * - クリック可能な要素はネイティブ <button> を使う。
 *   role="button" + tabindex + keydown の3点セットは1つ欠けると無言で壊れる
 * ========================================
 */

(function () {
    'use strict';

    // ========================================
    // FAQ アコーディオン
    // ========================================

    function initFAQ() {
        const list = document.querySelector('.faq-list');
        if (!list) return;

        list.addEventListener('click', function (e) {
            const button = e.target.closest('.faq-question');
            if (!button || !list.contains(button)) return;

            const item = button.closest('.faq-item');
            if (!item) return;

            const answer = item.querySelector('.faq-answer');
            const icon = button.querySelector('.toggle-icon');
            const willExpand = button.getAttribute('aria-expanded') !== 'true';

            button.setAttribute('aria-expanded', String(willExpand));
            if (answer) answer.setAttribute('aria-hidden', String(!willExpand));
            if (icon) icon.textContent = willExpand ? 'expand_less' : 'expand_more';
        });
    }

    // ========================================
    // 特徴セクション: 詳細アコーディオン
    // ========================================

    function initFeatureAccordions() {
        const buttons = document.querySelectorAll('.feature-details-accordion');
        if (!buttons.length) return;

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                const item = button.closest('.feature-item');
                if (!item) return;

                const details = item.querySelector('.feature-details');
                const icon = button.querySelector('.accordion-icon');
                const label = button.querySelector('.accordion-text');
                const willExpand = button.getAttribute('aria-expanded') !== 'true';

                button.setAttribute('aria-expanded', String(willExpand));
                if (details) details.setAttribute('aria-hidden', String(!willExpand));
                if (icon) icon.textContent = willExpand ? 'expand_less' : 'expand_more';
                if (label) {
                    const next = willExpand
                        ? button.dataset.labelOpen
                        : button.dataset.labelClosed;
                    if (next) label.textContent = next;
                }
            });
        });
    }

    // ========================================
    // 画像スライダー
    // ========================================

    // 5枚以上のときインジケーターを省略表示する
    // （現在位置の前後と両端のみ表示し、省略部分は細い点で示す）
    function updateIndicators(slider, currentIndex) {
        const container = slider.querySelector('.slider-indicators');
        if (!container) return;

        const indicators = Array.prototype.slice.call(container.querySelectorAll('.indicator'));
        const total = indicators.length;

        indicators.forEach(function (indicator, index) {
            indicator.classList.toggle('active', index === currentIndex);
            indicator.classList.remove('visible', 'ellipsis');
        });

        if (total <= 4) return;

        // 表示する添字を決める
        let shown;
        let ellipsis;
        if (currentIndex <= 1) {
            shown = [0, 1, 2];
            ellipsis = [3];
        } else if (currentIndex >= total - 2) {
            shown = [total - 3, total - 2, total - 1];
            ellipsis = [total - 4];
        } else {
            shown = [currentIndex - 1, currentIndex, currentIndex + 1];
            ellipsis = [0, total - 1];
        }

        indicators.forEach(function (indicator, index) {
            if (shown.indexOf(index) !== -1) {
                indicator.classList.add('visible');
            } else if (ellipsis.indexOf(index) !== -1) {
                indicator.classList.add('ellipsis');
            }
        });
    }

    function showSlide(slider, targetIndex) {
        const slides = Array.prototype.slice.call(slider.querySelectorAll('.slide'));
        if (!slides.length) return;

        let index = targetIndex;
        if (index >= slides.length) index = 0;
        if (index < 0) index = slides.length - 1;

        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === index);
        });
        updateIndicators(slider, index);
    }

    function currentSlideIndex(slider) {
        const slides = Array.prototype.slice.call(slider.querySelectorAll('.slide'));
        const active = slider.querySelector('.slide.active');
        return slides.indexOf(active);
    }

    function initImageSliders() {
        const sliders = document.querySelectorAll('.feature-image-slider');
        if (!sliders.length) return;

        sliders.forEach(function (slider) {
            const nav = slider.querySelector('.slider-navigation');
            if (nav) {
                nav.addEventListener('click', function (e) {
                    const arrow = e.target.closest('[data-slide-direction]');
                    if (arrow) {
                        const direction = parseInt(arrow.dataset.slideDirection, 10);
                        showSlide(slider, currentSlideIndex(slider) + direction);
                        return;
                    }

                    const indicator = e.target.closest('.indicator[data-index]');
                    if (indicator) {
                        showSlide(slider, parseInt(indicator.dataset.index, 10));
                    }
                });
            }

            // 省略表示の初期化（5枚以上のときだけ効く）
            updateIndicators(slider, 0);
        });
    }

    // ========================================
    // 体験申込フォーム（Google Forms の遅延ロード）
    // ========================================

    function initApplicationForm() {
        const toggle = document.querySelector('.application-toggle');
        const form = document.getElementById('application-form');
        if (!toggle || !form) return;

        const iframe = document.getElementById('application-iframe');
        const status = document.getElementById('form-status');
        const container = form.querySelector('.google-form-container');
        let loadStarted = false;

        function showFallback() {
            if (!status || !container) return;
            const url = container.dataset.formUrl;
            const title = status.querySelector('.form-status-title');
            const note = status.querySelector('.form-status-note');
            if (title) title.textContent = status.dataset.errorTitle || title.textContent;
            if (note && url) {
                note.innerHTML = '';
                const link = document.createElement('a');
                link.href = url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.className = 'btn-primary';
                link.textContent = status.dataset.errorAction || '別ウィンドウで開く';
                note.appendChild(link);
            }
        }

        // 初回展開時に初めて iframe を読み込む。
        // load リスナーは src 代入より先に登録する（キャッシュヒット時の取りこぼしを防ぐ）
        function startLoading() {
            if (loadStarted || !iframe || !iframe.dataset.src) return;
            loadStarted = true;

            // 唯一意味のあるコンバージョン指標。
            // Google フォームは iframe（クロスオリジン）なので送信完了は計測できないが、
            // 「フォームを開いた」は取れる。GA4 管理画面でキーイベントに設定して使う。
            // 初回展開時だけ送る（loadStarted のガードの後）。
            // gtag は本番ビルドでのみ定義されるため存在チェックが必要。
            if (typeof window.gtag === 'function') {
                window.gtag('event', 'trial_form_open');
            }

            const timer = setTimeout(showFallback, 10000);

            iframe.addEventListener('load', function () {
                clearTimeout(timer);
                if (status) status.hidden = true;
                iframe.hidden = false;
            });

            iframe.addEventListener('error', function () {
                clearTimeout(timer);
                showFallback();
            });

            iframe.src = iframe.dataset.src;
        }

        toggle.addEventListener('click', function () {
            const icon = toggle.querySelector('.toggle-icon');
            const willExpand = toggle.getAttribute('aria-expanded') !== 'true';

            toggle.setAttribute('aria-expanded', String(willExpand));
            form.setAttribute('aria-hidden', String(!willExpand));
            if (icon) {
                const next = willExpand
                    ? toggle.dataset.iconCollapse
                    : toggle.dataset.iconExpand;
                if (next) icon.textContent = next;
            }

            if (willExpand) startLoading();
        });
    }

    // ========================================
    // 初期化
    // ========================================

    function init() {
        initFAQ();
        initFeatureAccordions();
        initImageSliders();
        initApplicationForm();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
