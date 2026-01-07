"use client"; // アニメーションを使うため client component にします

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Sparkles } from "lucide-react";
import MarketingHeader from "./header/MarketingHeader";

export default function HomePage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      {/* ナビゲーション */}
      <MarketingHeader></MarketingHeader>

      <main className="flex-1">
        {/* ヒーローセクション */}
        <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
          <div className="container mx-auto px-4 text-center">
            <motion.div {...fadeIn}>
              <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-blue-50 text-blue-600 rounded-full ring-1 ring-inset ring-blue-700/10">
                次世代のタスク管理ツール
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
                作業を、
                <br className="md:hidden" />
                <span className="bg-linear-to-r from-indigo-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  もっとシンプルに。
                </span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
                複雑なワークフローを自動化し、クリエイティブな時間に集中しましょう。
                直感的な操作で、あなたのチームの可能性を引き出します。
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-14 px-8 text-lg rounded-full"
                >
                  <div className="pl-2">無料で試してみる</div>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-14 px-8 text-lg rounded-full"
                >
                  デモを確認
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 特徴一覧セクション */}
        <section id="features" className="py-24 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                delay={0.1}
                icon={<Zap className="h-6 w-6 text-white" />}
                title="超高速レスポンス"
                description="Next.jsの最新機能により、瞬時の画面遷移と快適な操作を実現。"
              />
              <FeatureCard
                delay={0.2}
                icon={<Shield className="h-6 w-6 text-white" />}
                title="エンタープライズ級セキュリティ"
                description="最高水準の暗号化技術で、あなたの貴重なデータを守り抜きます。"
              />
              <FeatureCard
                delay={0.3}
                icon={<Sparkles className="h-6 w-6 text-white" />}
                title="AI自動最適化"
                description="あなたのスタイルを学習し、最適なワークフローを提案します。"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-500/10 group"
    >
      <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}
