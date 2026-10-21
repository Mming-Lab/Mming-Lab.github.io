source "https://rubygems.org"

# GitHub Pages 互換のためのメイン gem
# 注: GitHub Pages のビルド方式は legacy のため、本番は Gemfile / Gemfile.lock を
# 読まない（サーバ側に固定された github-pages でビルドされる）。
# ここでの指定はローカルで本番と同じ環境を再現するためのもの。
# 更新の目安: https://pages.github.com/versions/ と Gemfile.lock を年1回見比べる。
gem "github-pages", "~> 232", group: :jekyll_plugins

# 注: jekyll-feed / jekyll-sitemap / jekyll-redirect-from は github-pages gem に
# 含まれているため個別指定は不要。有効化は _config.yml の plugins で行う。
# 以前は jekyll-seo-tag も入っていたが、plugins に未登録で {% seo %} も
# 使っておらず（メタタグは _layouts/default.html の手書き）完全に無効だったため外した。

# Windows での開発サポート
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

gem "webrick", "~> 1.7"

# 開発時のファイル監視
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]
