import Link from "next/link";
import { ArrowLeft, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-muted/30 p-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/register">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-foreground" />
            <span className="text-xl font-semibold text-foreground">
              TaskFlow
            </span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">プライバシーポリシー</CardTitle>
            <p className="text-sm text-muted-foreground">
              最終更新日: 2026年1月4日
            </p>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                1. 基本方針
              </h2>
              <p className="text-muted-foreground">
                TaskFlow(以下、「当社」といいます)は、お客様の個人情報保護の重要性について認識し、個人情報の保護に関する法律(以下、「個人情報保護法」といいます)を遵守すると共に、以下のプライバシーポリシー(以下、「本ポリシー」といいます)に従い、適切な取扱い及び保護に努めます。
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                2. 個人情報の定義
              </h2>
              <p className="text-muted-foreground">
                本ポリシーにおいて、個人情報とは、個人情報保護法第2条第1項により定義された個人情報、すなわち、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、その他の記述等により特定の個人を識別することができるもの(他の情報と容易に照合することができ、それにより特定の個人を識別することができることとなるものを含みます)、または個人識別符号が含まれる情報を指します。
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                3. 収集する情報
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>当社は、本サービスの提供にあたり、以下の情報を収集します:</p>
                <div className="space-y-3">
                  <div>
                    <h3 className="mb-2 font-semibold text-foreground">
                      3.1 ユーザーが提供する情報
                    </h3>
                    <ul className="list-disc space-y-1 pl-6">
                      <li>ユーザー名、メールアドレス</li>
                      <li>プロフィール情報</li>
                      <li>タスクやプロジェクトの内容</li>
                      <li>お問い合わせ内容</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-foreground">
                      3.2 自動的に収集される情報
                    </h3>
                    <ul className="list-disc space-y-1 pl-6">
                      <li>IPアドレス</li>
                      <li>ブラウザの種類とバージョン</li>
                      <li>デバイス情報</li>
                      <li>アクセス日時</li>
                      <li>Cookie情報</li>
                      <li>利用状況データ</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                4. 利用目的
              </h2>
              <div className="space-y-2 text-muted-foreground">
                <p>収集した個人情報は、以下の目的で利用します:</p>
                <ul className="list-disc space-y-1 pl-6">
                  <li>本サービスの提供、運営、維持、保護及び改善のため</li>
                  <li>ユーザーサポートの提供のため</li>
                  <li>本サービスに関する重要なお知らせの送信のため</li>
                  <li>利用規約違反への対応のため</li>
                  <li>本サービスの利用状況の分析及び改善のため</li>
                  <li>新機能やキャンペーン情報のご案内のため</li>
                  <li>不正利用の防止のため</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                5. 第三者への提供
              </h2>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  当社は、以下の場合を除き、ユーザーの同意なく第三者に個人情報を提供しません:
                </p>
                <ul className="list-disc space-y-1 pl-6">
                  <li>法令に基づく場合</li>
                  <li>人の生命、身体または財産の保護のために必要がある場合</li>
                  <li>
                    公衆衛生の向上または児童の健全な育成の推進のために必要がある場合
                  </li>
                  <li>
                    国の機関等の法令の定める事務への協力で、ユーザーの同意を得ることが困難な場合
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                6. 安全管理措置
              </h2>
              <p className="text-muted-foreground">
                当社は、個人情報の漏えい、滅失または毀損の防止その他の個人情報の安全管理のために、組織的、人的、物理的及び技術的な安全管理措置を講じます。
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                7. Cookieの使用
              </h2>
              <p className="text-muted-foreground">
                本サービスでは、ユーザー体験の向上及びサービスの分析のためにCookieを使用しています。Cookieの使用を望まない場合は、ブラウザの設定で無効にすることができますが、一部の機能が正常に動作しない可能性があります。
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                8. ユーザーの権利
              </h2>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  ユーザーは、当社が保有する自己の個人情報について、以下の権利を有します:
                </p>
                <ul className="list-disc space-y-1 pl-6">
                  <li>開示を求める権利</li>
                  <li>訂正、追加または削除を求める権利</li>
                  <li>利用の停止を求める権利</li>
                  <li>第三者への提供の停止を求める権利</li>
                </ul>
                <p className="mt-2">
                  これらの権利行使については、support@taskflow.comまでお問い合わせください。
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                9. 本ポリシーの変更
              </h2>
              <p className="text-muted-foreground">
                当社は、法令の変更や本サービスの変更等に伴い、本ポリシーを変更することがあります。変更後のプライバシーポリシーは、本サービス上に掲示された時点で効力を生じるものとします。
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                10. お問い合わせ
              </h2>
              <p className="text-muted-foreground">
                本ポリシーに関するご質問やご不明な点がございましたら、support@taskflow.comまでお問い合わせください。
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
