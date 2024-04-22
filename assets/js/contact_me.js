$(function() {

  $("#contactForm input,#contactForm textarea").jqBootstrapValidation({
    preventSubmit: true,
    submitError: function($form, event, errors) {
      // 追加のエラーメッセージまたはイベント
    },
    submitSuccess: function($form, event) {
      event.preventDefault(); // デフォルトの送信動作を防ぐ
      // FORMから値を取得する
	    // var url = "https://formspree.io/" + "{% if site.formspree_form_path %}{{ site.formspree_form_path }}{% else %}{{ site.email }}{% endif %}";
      var url = "https://script.google.com/macros/s/AKfycbwlY6imoOGCwZg6vfDT5OcCZ23LS2D7o-NFxxlouiw8Seo7TEdKkmzgmRYk1XMvsR2s/exec";
      var name = $("input#name").val();
      var email = $("input#email").val();
      var phone = $("input#phone").val();
      var message = $("textarea#message").val();
      var firstName = name; //  成功/失敗メッセージ用
      // 成功/失敗メッセージの名前に空白がないかチェックする
      if (firstName.indexOf(' ') >= 0) {
        firstName = name.split(' ').slice(0, -1).join(' ');
      }
      $this = $("#sendMessageButton");
      $this.prop("disabled", true); // メッセージの重複を防ぐため、AJAX呼び出しが完了するまで送信ボタンを無効にする。
      $.ajax({
        url: url,
        type: "POST",
	dataType: "json",
        data: {
          name: name,
          phone: phone,
          email: email,
          message: message
        },
        cache: false,

		success: function() {
          // Success message
          $('#success').html("<div class='alert alert-success'>");
          $('#success > .alert-success').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
            .append("</button>");
          $('#success > .alert-success')
            .append("<strong>メッセージが送信されました。</strong>");
          $('#success > .alert-success')
            .append('</div>');
          //clear all fields
          $('#contactForm').trigger("reset");
        },

        error: function() {
          // Fail message
          $('#success').html("<div class='alert alert-danger'>");
          $('#success > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
            .append("</button>");
          $('#success > .alert-danger').append($("<strong>").text(firstName +"様、申し訳ありません、。メールサーバーが応答していないようです。後でもう一度お試しください！"));
          $('#success > .alert-danger').append('</div>');
          //clear all fields
          $('#contactForm').trigger("reset");
        },

        complete: function() {
          setTimeout(function() {
            $this.prop("disabled", false); // AJAX呼び出しの完了時に送信ボタンを再度有効にする
          }, 1000);
        }
      });
    },
    filter: function() {
      return $(this).is(":visible");
    },
  });

  $("a[data-toggle=\"tab\"]").click(function(e) {
    e.preventDefault();
    $(this).tab("show");
  });
});

/*失敗/成功ボックスを完全に隠すをクリックした場合 */
$('#name').focus(function() {
  $('#success').html('');
});
