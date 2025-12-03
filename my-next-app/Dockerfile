FROM node:20-alpine AS builder
# Node.js20を使い"builder"として扱う。

WORKDIR /app
# 作業ディレクトリを"/app"に設定。

COPY package*.json ./
# package.jsonとpackage-lock.jsonをコピーし、依存関係をインストール。

RUN npm install
COPY . .
RUN npm run build
# アプリケーションのソースコードをコピーし、ビルドコマンドを実行。

#####################
### ビルド専用の記述 ###
#####################



FROM node:20-alpine
# 同じくNode.js20を使う。（先ほど環境とは別でクリーンな状態）

WORKDIR /app
# 作業ディレクトリを"/app"に設定。

COPY --from=builder /app ./
# "先ほどのビルド環境 = builder"からビルド済みのアプリケーションをコピー。
# (一時ファイルは含まれない為イメージのサイズダウンが可能)

EXPOSE 3000
# コンテナの3000番ポートを公開。

CMD ["npm", "start"]
# コンテナ起動時に"npm start"コマンドを実行。

####################
### 実行専用の記述 ###
####################