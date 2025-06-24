source "https://rubygems.org"

# GitHub Pages互換性のためのメインgem（2024年12月現在の最新版）
gem "github-pages", "~> 232", group: :jekyll_plugins

# Jekyll標準プラグイン（GitHub Pagesでサポートされているもの）
# バージョンは github-pages gem に含まれているため指定不要
group :jekyll_plugins do
  gem "jekyll-feed"
  gem "jekyll-sitemap" 
  gem "jekyll-seo-tag"
  gem "jekyll-relative-links"
  gem "jekyll-optional-front-matter"
  gem "jekyll-readme-index"
  gem "jekyll-default-layout"
  gem "jekyll-titles-from-headings"
end

# Windowsでの開発サポート
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# パフォーマンス向上のため
gem "webrick", "~> 1.7"

# 開発時のファイル監視
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]