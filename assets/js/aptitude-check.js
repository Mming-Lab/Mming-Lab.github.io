/**
 * mmingプログラミング教室 - 適性チェックシステム
 * 発達多様性の子ども向け適性チェックの実装
 */

// ========================================
// 適性チェックシステム クラス
// ========================================

class AptitudeCheckSystem {
    constructor(aptitudeData) {
        this.aptitudeData = aptitudeData;
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.totalScore = 0;
        
        // DOM要素の取得
        this.initializeDOMElements();
        
        // イベントリスナーの設定
        this.setupEventListeners();
    }

    /**
     * DOM要素を初期化
     */
    initializeDOMElements() {
        this.startButton = document.getElementById('start-aptitude-check');
        this.checkContainer = document.getElementById('aptitude-check-container');
        this.questionContainer = document.getElementById('question-container');
        this.resultContainer = document.getElementById('result-container');
        this.trialApplication = document.getElementById('trial-application');
        this.progressFill = document.getElementById('progress-fill');
        this.currentQuestionSpan = document.getElementById('current-question');
        this.prevButton = document.getElementById('prev-button');
        this.nextButton = document.getElementById('next-button');
        
        // 必要な要素が存在するかチェック
        if (!this.startButton || !this.checkContainer || !this.questionContainer) {
            console.error('適性チェックシステムの必要な要素が見つかりません');
        }
    }

    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // 適性チェック開始ボタン
        if (this.startButton) {
            this.startButton.addEventListener('click', () => {
                this.startAptitudeCheck();
            });
        }

        // 前の質問ボタン
        if (this.prevButton) {
            this.prevButton.addEventListener('click', () => {
                this.goToPreviousQuestion();
            });
        }

        // 次の質問ボタン
        if (this.nextButton) {
            this.nextButton.addEventListener('click', () => {
                this.goToNextQuestion();
            });
        }
    }

    /**
     * 適性チェックを開始
     */
    startAptitudeCheck() {
        // 開始セクションを非表示
        const startSection = document.querySelector('.aptitude-start-section');
        if (startSection) {
            startSection.style.display = 'none';
        }
        
        // チェックコンテナを表示
        this.checkContainer.style.display = 'block';
        
        // 最初の質問を表示
        this.showQuestion(0);
        this.updateProgress();
        
        // アクセシビリティ：チェック開始をアナウンス
        this.announceToScreenReader('適性チェックを開始しました');
        
        // 質問セクションにフォーカスを移動
        setTimeout(() => {
            const firstQuestion = this.questionContainer.querySelector('h3');
            if (firstQuestion) {
                firstQuestion.focus();
            }
        }, 100);
    }

    /**
     * 指定されたインデックスの質問を表示
     * @param {number} index - 質問のインデックス
     */
    showQuestion(index) {
        const question = this.aptitudeData.questions[index];
        
        // 質問HTMLを生成
        const questionHTML = this.generateQuestionHTML(question);
        this.questionContainer.innerHTML = questionHTML;
        
        // 前回の回答を復元
        this.restorePreviousAnswer(question);
        
        // 回答選択のイベントリスナーを設定
        this.setupAnswerEventListeners(question);
        
        // ナビゲーションボタンの状態を更新
        this.updateNavigationButtons();
    }

    /**
     * 質問のHTMLを生成
     * @param {Object} question - 質問オブジェクト
     * @returns {string} 質問のHTML
     */
    generateQuestionHTML(question) {
        const optionsHTML = question.options.map((option, optionIndex) => `
            <label class="option-label">
                <input type="radio" name="question-${question.id}" value="${option.value}" data-points="${option.points}">
                <span class="option-text">${option.text}</span>
            </label>
        `).join('');

        return `
            <div class="question-card">
                <h3 class="question-title" tabindex="-1">${question.title}</h3>
                <p class="question-description">${question.description}</p>
                <div class="options-container">
                    ${optionsHTML}
                </div>
            </div>
        `;
    }

    /**
     * 前回の回答を復元
     * @param {Object} question - 質問オブジェクト
     */
    restorePreviousAnswer(question) {
        if (this.answers[question.id]) {
            const selectedInput = this.questionContainer.querySelector(`input[value="${this.answers[question.id]}"]`);
            if (selectedInput) {
                selectedInput.checked = true;
            }
        }
    }

    /**
     * 回答選択のイベントリスナーを設定
     * @param {Object} question - 質問オブジェクト
     */
    setupAnswerEventListeners(question) {
        const radioInputs = this.questionContainer.querySelectorAll('input[type="radio"]');
        radioInputs.forEach(input => {
            input.addEventListener('change', () => {
                // 回答を保存
                this.answers[question.id] = input.value;
                
                // 次のボタンを有効化
                this.nextButton.disabled = false;
            });
        });
    }

    /**
     * プログレスバーを更新
     */
    updateProgress() {
        const progress = ((this.currentQuestionIndex + 1) / this.aptitudeData.questions.length) * 100;
        this.progressFill.style.width = progress + '%';
        this.currentQuestionSpan.textContent = this.currentQuestionIndex + 1;
    }

    /**
     * ナビゲーションボタンの状態を更新
     */
    updateNavigationButtons() {
        // 前のボタンの状態
        this.prevButton.disabled = this.currentQuestionIndex === 0;
        
        // 次のボタンの状態
        const currentQuestion = this.aptitudeData.questions[this.currentQuestionIndex];
        const hasAnswer = this.answers[currentQuestion.id];
        this.nextButton.disabled = !hasAnswer;
        
        // 最後の質問の場合、ボタンテキストを変更
        if (this.currentQuestionIndex === this.aptitudeData.questions.length - 1) {
            this.nextButton.innerHTML = `結果を見る <span class="material-icons" aria-hidden="true">assessment</span>`;
        } else {
            this.nextButton.innerHTML = `次の質問 <span class="material-icons" aria-hidden="true">arrow_forward</span>`;
        }
    }

    /**
     * 前の質問に戻る
     */
    goToPreviousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.showQuestion(this.currentQuestionIndex);
            this.updateProgress();
        }
    }

    /**
     * 次の質問に進む、または結果を表示
     */
    goToNextQuestion() {
        if (this.currentQuestionIndex < this.aptitudeData.questions.length - 1) {
            // 次の質問へ
            this.currentQuestionIndex++;
            this.showQuestion(this.currentQuestionIndex);
            this.updateProgress();
        } else {
            // 結果を計算・表示
            this.calculateAndShowResult();
        }
    }

    /**
     * 結果を計算し表示
     */
    calculateAndShowResult() {
        // スコアを計算（新方式）
        this.totalScore = 0;
        this.coreScore = 0;
        
        this.aptitudeData.questions.forEach(question => {
            const answer = this.answers[question.id];
            const option = question.options.find(opt => opt.value === answer);
            if (option) {
                const points = option.points;
                this.totalScore += points;
                
                // 最重要領域（core）の得点を集計
                if (question.importance === 'core') {
                    this.coreScore += points;
                }
            }
        });
        
        // 結果判定
        const resultType = this.determineResultType();
        const result = this.aptitudeData.results[resultType];
        
        // 結果を表示
        this.displayResult(result);
    }

    /**
     * スコアに基づいて結果タイプを判定（複合判定）
     * @returns {string} 結果タイプ（high, medium, low）
     */
    determineResultType() {
        const thresholds = this.aptitudeData.scoring.thresholds;
        
        // 高適性：総合50点以上 かつ 最重要領域20点以上
        if (this.totalScore >= thresholds.high.total && this.coreScore >= thresholds.high.core) {
            return 'high';
        }
        // 中適性：総合35点以上 または 最重要領域15点以上
        else if (this.totalScore >= thresholds.medium.total || this.coreScore >= thresholds.medium.core) {
            return 'medium';
        }
        // 低適性：上記未満
        else {
            return 'low';
        }
    }

    /**
     * 結果を表示
     * @param {Object} result - 結果オブジェクト
     */
    displayResult(result) {
        // 結果HTMLを生成
        const resultHTML = this.generateResultHTML(result);
        
        // 表示を切り替え
        this.checkContainer.style.display = 'none';
        this.resultContainer.style.display = 'block';
        document.getElementById('result-content').innerHTML = resultHTML;
        
        // 体験申込ボタンのイベントリスナーを設定
        this.setupTrialApplicationButton();
    }

    /**
     * 結果表示のHTMLを生成
     * @param {Object} result - 結果オブジェクト
     * @returns {string} 結果のHTML
     */
    generateResultHTML(result) {
        // スコア表示（保護者向けには非表示）
        const scoreDisplay = `
            <!-- スコア詳細は内部処理のみ、保護者には表示しない -->
        `;
        
        // 代替提案（低適性の場合）
        const alternativeSuggestions = result.alternative_suggestions ? `
            <div class="alternative-suggestions">
                ${result.alternative_suggestions.replace(/\n/g, '<br>')}
            </div>
        ` : '';

        return `
            <div class="result-card">
                <div class="result-icon">
                    <span class="material-icons">${result.icon}</span>
                </div>
                <h2 class="result-title">${result.title}</h2>
                <div class="result-message">
                    ${result.message.replace(/\n/g, '<br>')}
                </div>
                <p class="result-sub-message">${result.sub_message}</p>
                ${alternativeSuggestions}
                ${result.encouragement ? `
                    <div class="result-encouragement">
                        ${result.encouragement.replace(/\n/g, '<br>')}
                    </div>
                ` : ''}
                <div class="result-actions">
                    ${result.cta.action !== 'close' && result.cta.action !== 'consult' ? `
                        <button class="cta-button primary" id="show-trial-form">
                            ${result.cta.text}
                        </button>
                    ` : `
                        <a href="/" class="cta-button secondary">
                            ${result.cta.text}
                        </a>
                    `}
                </div>
            </div>
        `;
    }

    /**
     * 体験申込ボタンのイベントリスナーを設定
     */
    setupTrialApplicationButton() {
        const showTrialButton = document.getElementById('show-trial-form');
        if (showTrialButton) {
            showTrialButton.addEventListener('click', () => {
                this.trialApplication.style.display = 'block';
                this.trialApplication.scrollIntoView({ behavior: 'smooth' });
            });
        }
    }

    /**
     * スクリーンリーダー用アナウンス
     * @param {string} message - アナウンスメッセージ
     */
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        // 短時間後に削除
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
}

// ========================================
// 初期化処理
// ========================================

/**
 * 適性チェックシステムを初期化
 * @param {Object} aptitudeData - Jekyll から渡される適性チェックデータ
 */
function initializeAptitudeCheck(aptitudeData) {
    // 適性チェックシステムのインスタンスを作成
    const aptitudeSystem = new AptitudeCheckSystem(aptitudeData);
    
    // デバッグ情報を出力
    console.log('適性チェックシステム初期化完了');
    console.log('質問数:', aptitudeData.questions.length);
    
    // グローバルに公開（デバッグ用）
    window.AptitudeCheck = aptitudeSystem;
}

// 外部から呼び出し可能な初期化関数を公開
window.initializeAptitudeCheck = initializeAptitudeCheck;