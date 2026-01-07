import Link from "next/link";
import { ArrowLeft, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
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
            <CardTitle className="text-3xl">利用規約</CardTitle>
            <p className="text-sm text-muted-foreground">
              最終更新日: 2026年1月4日
            </p>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                1. はじめに
              </h2>
              <p className="text-muted-foreground">
                本利用規約(以下、「本規約」といいます)は、TaskFlow(以下、「当社」といいます)が提供するタスク管理サービス(以下、「本サービス」といいます)の利用条件を定めるものです。本サービスをご利用いただく際には、本規約に同意していただく必要があります。
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                2. アカウント登録
              </h2>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  本サービスの利用には、アカウント登録が必要です。登録時には、正確で最新の情報を提供してください。
                </p>
                <ul className="list-disc space-y-1 pl-6">
                  <li>18歳以上の方のみ登録が可能です</li>
                  <li>1人につき1つのアカウントのみ登録できます</li>
                  <li>アカウント情報の管理責任はユーザーにあります</li>
                  <li>
                    不正なアカウント使用が発覚した場合、アカウントを停止する場合があります
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                3. 禁止事項
              </h2>
              <div className="space-y-2 text-muted-foreground">
                <p>本サービスの利用にあたり、以下の行為を禁止します:</p>
                <ul className="list-disc space-y-1 pl-6">
                  <li>法令または公序良俗に違反する行為</li>
                  <li>犯罪行為に関連する行為</li>
                  <li>他のユーザーまたは第三者の権利を侵害する行為</li>
                  <li>本サービスの運営を妨害する行為</li>
                  <li>不正アクセスまたはこれを試みる行為</li>
                  <li>本サービスのリバースエンジニアリング</li>
                  <li>営利目的での本サービスの無断使用</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                4. 知的財産権
              </h2>
              <p className="text-muted-foreground">
                本サービスに関する知的財産権は、すべて当社または当社にライセンスを許諾している第三者に帰属します。ユーザーが本サービスを通じて作成したコンテンツの著作権は、ユーザーに帰属します。
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                5. サービスの変更・終了
              </h2>
              <p className="text-muted-foreground">
                当社は、ユーザーへの事前通知なく、本サービスの内容を変更または終了することができます。これによりユーザーに損害が生じた場合でも、当社は一切の責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                6. 免責事項
              </h2>
              <div className="space-y-2 text-muted-foreground">
                <p>当社は、以下の事項について一切の責任を負いません:</p>
                <ul className="list-disc space-y-1 pl-6">
                  <li>本サービスの利用によりユーザーに生じた損害</li>
                  <li>ユーザー間のトラブルによる損害</li>
                  <li>第三者によるサービスの不正利用による損害</li>
                  <li>天災、戦争、暴動等の不可抗力による損害</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                7. 規約の変更
              </h2>
              <p className="text-muted-foreground">
                当社は、必要に応じて本規約を変更することができます。変更後の規約は、本サービス上に掲示された時点で効力を生じるものとします。
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                8. お問い合わせ
              </h2>
              <p className="text-muted-foreground">
                本規約に関するご質問やご不明な点がございましたら、support@taskflow.comまでお問い合わせください。
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
