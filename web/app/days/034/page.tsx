"use client";

import React, { useState, useEffect } from 'react';

/**
 * MyBatis Learning Guide App
 * 100 Days of Code - Day 034
 */

// 学習コンテンツの定義
const LESSONS = [
  {
    title: "1. 設定 (mybatis-config.xml)",
    description: "データベース接続やマッパーの登録を行います。",
    code: `<configuration>\n  <environments default="development">\n    <environment id="development">\n      <transactionManager type="JDBC"/>\n      <dataSource type="POOLED">\n        <property name="driver" value="com.mysql.cj.jdbc.Driver"/>\n      </dataSource>\n    </environment>\n  </environments>\n</configuration>`,
  },
  {
    title: "2. XMLマッパー (UserMapper.xml)",
    description: "SQLをXMLに記述し、IDでJavaから呼び出せるようにします。",
    code: `<mapper namespace="com.example.UserMapper">\n  <select id="getUser" resultType="User">\n    SELECT * FROM users WHERE id = #{id}\n  </select>\n</mapper>`,
  },
  {
    title: "3. アノテーション (Interface)",
    description: "簡単なSQLなら、Javaインターフェースに直接記述することも可能です。",
    code: `public interface UserMapper {\n  @Select("SELECT * FROM users WHERE id = #{id}")\n  User getUser(int id);\n}`,
  },
  {
    title: "4. 実行 (SqlSession)",
    description: "セッションを開いて、マッパーを実行します。",
    code: `try (SqlSession session = sqlSessionFactory.openSession()) {\n  UserMapper mapper = session.getMapper(UserMapper.class);\n  User user = mapper.getUser(1);\n}`,
  },
];

export default function MybatisTutor() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);

  // 完了状態をローカルストレージから復元
  useEffect(() => {
    const saved = localStorage.getItem('mybatis-progress');
    if (saved) setCompleted(JSON.parse(saved));
  }, []);

  // 進捗を保存
  const markAsDone = (index: number) => {
    if (!completed.includes(index)) {
      const newProgress = [...completed, index];
      setCompleted(newProgress);
      localStorage.setItem('mybatis-progress', JSON.stringify(newProgress));
    }
    if (currentStep < LESSONS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* ヘッダーセクション */}
        <div className="bg-indigo-600 p-6 text-white">
          <h1 className="text-2xl font-bold">MyBatis 30分マスター講義</h1>
          <p className="mt-2 text-indigo-100">Java開発者のためのSQLマッピング集中講座</p>
          <div className="mt-4 bg-indigo-800 rounded-full h-2 w-full">
            <div 
              className="bg-green-400 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${(completed.length / LESSONS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row min-h-[400px]">
          {/* 左側：サイドバー（目次） */}
          <div className="w-full md:w-1/3 bg-gray-100 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {LESSONS.map((lesson, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-full text-left p-3 rounded transition ${
                    currentStep === index ? 'bg-white shadow-md border-l-4 border-indigo-500' : 'hover:bg-gray-200'
                  }`}
                >
                  <span className={`text-sm ${completed.includes(index) ? 'text-green-600 font-bold' : 'text-gray-600'}`}>
                    {completed.includes(index) ? '✓ ' : ''} Step {index + 1}
                  </span>
                  <div className="text-sm font-medium truncate">{lesson.title}</div>
                </button>
              ))}
            </nav>
          </div>

          {/* 右側：コンテンツ表示領域 */}
          <div className="w-full md:w-2/3 p-6 flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{LESSONS[currentStep].title}</h2>
            <p className="text-gray-600 mb-6">{LESSONS[currentStep].description}</p>
            
            <div className="relative group">
              <div className="absolute -top-3 right-4 bg-gray-800 text-white text-xs px-2 py-1 rounded">Code</div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm leading-relaxed mb-6 border border-gray-700">
                <code>{LESSONS[currentStep].code}</code>
              </pre>
            </div>

            <div className="mt-auto flex justify-between items-center">
              <span className="text-sm text-gray-500">
                進捗: {completed.length} / {LESSONS.length} 完了
              </span>
              <button
                onClick={() => markAsDone(currentStep)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                {completed.includes(currentStep) ? '次へ進む' : '理解した！'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="mt-8 text-center text-gray-400 text-sm">
        <p>Tip: MyBatisでは #{'{variable}'} を使うことでSQLインジェクションを防ぐプリペアドステートメントが生成されます。</p>
      </footer>
    </div>
  );
}