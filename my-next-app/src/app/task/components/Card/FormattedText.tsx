"use client";
import React from "react";

// Propsの型を明示的に定義する
type FormattedTextProps = {
  text: string | undefined;
  style?: object;
};

// Reactの関数コンポーネントとしてProps（{ title }）を受け取る
const FormattedText = ({ text, style }: FormattedTextProps) => {
  const safeTitle = text || "";

  return (
    // <strong/>は表示のみのコンポーネントなので、Fragmentで囲む必要はありません
    <div style={style}>
      {/* 安全な文字列 (safeTitle) を使用して split を呼び出す */}
      {safeTitle.split("\n").map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {/* 最後の行以外に <br /> を挿入して改行させる */}
          {index !== safeTitle.split("\n").length - 1 && <br />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default FormattedText;
