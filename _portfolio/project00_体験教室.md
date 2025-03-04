---
caption:
  title: 体験教室
  subtitle: 体験教室
  thumbnail: assets/img/portfolio/教室イメージ4_400×300.jpg

title: 体験教室
subtitle: 体験教室
isMc: false
list:
  - type: img
    path: assets/img/portfolio/教室イメージ4_700.jpg
  - type: video
    path: assets/img/portfolio/chicken.mp4
---
### プログラミング親和性チェックリスト

子どもたちは、それぞれ異なる興味や得意分野を持っています。
このチェックリストを通して、お子様がプログラミングに親しめる可能性を探ってみませんか。
当教室では、プログラミングを楽しいと感じる子どもが、より楽しめるように特性に合わせて柔軟に対応します。

<form id="checklist-form">
  <ul class="list-inline-left">
    <li>
      <label>
        <input type="checkbox" class="check-item" data-score="12"><strong>パターン探究: </strong>数列や図形の規則性を見つけることに楽しさを感じる(12p)
      </label>
    </li>
    <li>
      <label>
        <input type="checkbox" class="check-item" data-score="12"><strong>段階的思考: </strong>順を追って考える文章問題や推理問題に興味を示す(12p)
      </label>
    </li>
    <li>
      <label>
        <input type="checkbox" class="check-item" data-score="10"><strong>自発的探求: </strong>興味を持ったことを自分から調べたり、深く知ろうとする(10p)
      </label>
    </li>
    <li>
      <label>
        <input type="checkbox" class="check-item" data-score="10"><strong>創造的アプローチ: </strong>「別の方法はないかな」と異なる解決策を考えることがある(10p)
      </label>
    </li>
    <li>
      <label>
        <input type="checkbox" class="check-item" data-score="8"><strong>テクノロジー好奇心: </strong>新しい機械やデジタル機器に自然と目が向く(8p)
      </label>
    </li>
    <li>
      <label>
        <input type="checkbox" class="check-item" data-score="8"><strong>没頭と集中: </strong>興味のあることに時間を忘れて集中して取り組める(8p)
      </label>
    </li>
    <li>
      <label>
        <input type="checkbox" class="check-item" data-score="18"><strong>問題解決の粘り強さ: </strong>難しい課題にも「もう少し」と諦めずに取り組み続ける(18p)
      </label>
    </li>
    <li>
      <label>
        <input type="checkbox" class="check-item" data-score="15"><strong>手順理解と整理力: </strong>説明を聞いて次のステップが分かり、情報を整理できる(15p)
      </label>
    </li>
    <li>
      <label>
        <input type="checkbox" class="check-item" data-score="7"><strong>フィードバック活用: </strong>失敗や間違いから学び、次に活かそうとする姿勢がある(7p)
      </label>
    </li>
  </ul>
  <strong>
    🖥️<span id="result-message">該当する項目にチェックしましょう</span>
  </strong>
  <p>
    🔋ポイント: <span id="total-score">0</span>
  </p>
</form>

---

##### まずは教室の雰囲気を感じてみませんか？
お子様がリラックスできるよう、一度に1組ずつ体験教室を行っています。
##### [発達多様性クラス申込フォーム](https://forms.gle/xz8XFBwxpzadWekL7)

<script>
  document.addEventListener("DOMContentLoaded", function() {
    const checkboxes = document.querySelectorAll(".check-item");
    const totalScoreElement = document.getElementById("total-score");
    const resultMessageElement = document.getElementById("result-message");

    function updateScore() {
      let totalScore = 0;

      checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
          totalScore += parseInt(checkbox.getAttribute("data-score"), 10);
        }
      });

      totalScoreElement.textContent = totalScore;
      updateMessage(totalScore);
    }

    function updateMessage(score) {
      let message = "";
      
      if (score >= 80) {
        message = "プログラミングとの相性がとても良さそうです";
      } else if (score >= 60) {
        message = "プログラミングを楽しめる素質があります";
      } else if (score >= 40) {
        message = "プログラミング体験をきっかけに興味が広がるかもしれません";
      } else if (score > 0) {
        message = "プログラミングを楽しめないかもしれません<br>他の分野の興味も探ってみるとよいでしょう";
      } else {
        message = "該当する項目にチェックしましょう";
      }

      //resultMessageElement.textContent = message;
      resultMessageElement.innerHTML = message;
    }

    checkboxes.forEach(checkbox => {
      checkbox.addEventListener("change", updateScore);
    });
  });
</script>