// app/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function FlowLandingPageDark() {
  const router = useRouter();
  router.push("/login");

  return (
    <></>
    // <div className="min-h-screen bg-neutral-950 text-white selection:bg-indigo-500 selection:text-white">
    //   {/* --- Navbar --- */}
    //   <nav className="fixed w-full z-50 top-0 py-4 px-6 flex justify-between items-center backdrop-blur-md border-b border-white/10">
    //     <div className="text-xl font-bold tracking-tighter">FLOW</div>
    //     <button className="px-4 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-neutral-200 transition-colors">
    //       無料で始める
    //     </button>
    //   </nav>

    //   {/* --- Hero Section --- */}
    //   <section className="relative pt-32 pb-20 px-6 flex flex-col items-center text-center overflow-hidden">
    //     {/* Background Glow */}
    //     <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-[100px] -z-10" />

    //     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-indigo-300 mb-6">
    //       <span className="relative flex h-2 w-2">
    //         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
    //         <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
    //       </span>
    //       Offline-First Architecture
    //     </div>

    //     <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
    //       すべての操作が、
    //       <br />
    //       止まることなく流れる。
    //     </h1>
    //     <p className="max-w-2xl text-lg text-neutral-400 mb-10 leading-relaxed">
    //       <p>オフラインファーストが生み出す、圧倒的なレスポンス。</p>
    //       <p>
    //         ドラッグ&ドロップの直感的な操作と、生命感あふれるアニメーション。
    //       </p>
    //       <p>
    //         洗練されたデザインが、作業にすっと溶け込むような体験を届けます。
    //       </p>
    //     </p>

    //     {/* Main Visual / Demo Placeholder */}
    //     <div className="w-full max-w-5xl aspect-video bg-neutral-900 border border-white/10 rounded-xl shadow-2xl flex items-center justify-center relative overflow-hidden group">
    //       <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    //       <p className="text-neutral-500 font-mono text-sm">
    //         [ ここにDnDでカードがぷるんと動く動画/GIF ]
    //       </p>
    //     </div>
    //   </section>

    //   {/* --- Bento Grid Features --- */}
    //   <section className="py-24 px-6 max-w-6xl mx-auto">
    //     <h2 className="text-3xl font-bold mb-12 text-center">
    //       機能ではなく、体験を実装しました。
    //     </h2>
    //     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    //       {/* Feature 1: Speed */}
    //       <div className="md:col-span-2 p-8 rounded-2xl bg-neutral-900 border border-white/10 hover:border-indigo-500/50 transition-colors group">
    //         <h3 className="text-xl font-bold mb-2 text-white">
    //           Linear級のスピード
    //         </h3>
    //         <p className="text-neutral-400 mb-6">
    //           ローカルアプリのような挙動。クリックした瞬間に世界が変わります。
    //         </p>
    //         <div className="h-32 bg-neutral-800/50 rounded-lg flex items-center justify-center border border-white/5 font-mono text-xs text-green-400">
    //           Response Time: &lt; 16ms
    //         </div>
    //       </div>

    //       {/* Feature 2: Hint Chips */}
    //       <div className="p-8 rounded-2xl bg-neutral-900 border border-white/10 hover:border-indigo-500/50 transition-colors">
    //         <h3 className="text-xl font-bold mb-2 text-white">
    //           学習コストゼロ
    //         </h3>
    //         <p className="text-neutral-400 mb-6">
    //           いつの間にかショートカットを覚える「ヒントチップ」機能。
    //         </p>
    //         <div className="flex gap-2 justify-center">
    //           <button className="px-4 py-2 bg-neutral-800 rounded border border-white/10 text-sm relative group/btn">
    //             Task Create
    //             <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity">
    //               C
    //             </span>
    //           </button>
    //         </div>
    //       </div>

    //       {/* Feature 3: Philosophy */}
    //       <div className="md:col-span-3 p-8 rounded-2xl bg-gradient-to-r from-neutral-900 to-indigo-950/30 border border-white/10">
    //         <div className="flex flex-col md:flex-row items-center justify-between gap-8">
    //           <div className="max-w-xl">
    //             <h3 className="text-xl font-bold mb-2 text-white">
    //               あえて「繋がない」贅沢
    //             </h3>
    //             <p className="text-neutral-400">
    //               GitHub連携はありません。ここは開発ログの海ではなく、
    //               <br className="hidden md:block" />
    //               個人の思考とチームの実行速度を最大化する「聖域」だからです。
    //             </p>
    //           </div>
    //           <div className="shrink-0">
    //             <span className="text-5xl">🧘</span>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </section>

    //   {/* --- Footer CTA --- */}
    //   <section className="py-20 text-center border-t border-white/10">
    //     <h2 className="text-4xl font-bold mb-6">
    //       その指先に、新しいフローを。
    //     </h2>
    //     <div className="flex justify-center gap-4">
    //       <button className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-neutral-200 transition-colors">
    //         無料で体験する
    //       </button>
    //     </div>
    //   </section>
    // </div>
  );
}
