/* めんせつ（二次試験）練習セット {id, title, passage(約50語), qs:[{q, model:モデル回答, jhint:ヒント}]}
   ※公式のイラスト描写問題は画像素材が必要なため対象外（音読・パッセージ質問・意見質問をカバー）
   フェーズ3で 20セット規模に拡充予定 */
window.DATA_INTERVIEW = [
  { id: "iv01", title: "School Lunches",
    passage: "Many schools in Japan serve school lunches. Students often eat the same food together in their classroom. Some schools use vegetables grown by local farmers, so students can enjoy fresh food. School lunches help students learn about healthy eating.",
    qs: [
      { q: "According to the passage, why can students enjoy fresh food?",
        model: "Because some schools use vegetables grown by local farmers.",
        jhint: "答えはパッセージの中にあるよ。「why?」と聞かれたら Because 〜 で答えよう。" },
      { q: "What food do you like the best?",
        model: "I like curry and rice the best. My mother often cooks it for me.",
        jhint: "すきな食べ物＋もうひとこと（だれが作る？いつ食べる？）を言えるとバッチリ！" },
      { q: "Do you help your family at home?",
        model: "Yes. I wash the dishes after dinner and clean my room on weekends.",
        jhint: "Yes / No のあとに、なにをするか1〜2文つづけよう。" },
    ] },
  { id: "iv02", title: "Pets",
    passage: "These days, many people in Japan have pets. Dogs and cats are the most popular. Pets can make people happy and relaxed. However, taking care of pets takes time and money, so people should think carefully before getting a pet.",
    qs: [
      { q: "According to the passage, what should people do before getting a pet?",
        model: "They should think carefully because taking care of pets takes time and money.",
        jhint: "should のあとの部分をさがそう。think carefully =「よく考える」。" },
      { q: "Do you like animals?",
        model: "Yes, I do. I like dogs because they are friendly and cute.",
        jhint: "Yes / No ＋ 理由（because 〜）を言おう。" },
      { q: "What do you usually do on weekends?",
        model: "I usually play soccer with my friends in the park. I also do my homework.",
        jhint: "usually を使って、いつもすることを2つくらい言えるといいね。" },
    ] },
  { id: "iv03", title: "Shopping Malls",
    passage: "Shopping malls are popular in many towns. People can buy clothes, books, and food all in one place. Many malls also have movie theaters and restaurants. On weekends, some families spend all day there. Shopping malls are especially useful on rainy days.",
    qs: [
      { q: "According to the passage, what can people do at many malls?",
        model: "They can watch movies and eat at restaurants, and buy many things in one place.",
        jhint: "also のあとに注目。movie theaters と restaurants があると言っているよ。" },
      { q: "Do you often go shopping with your family?",
        model: "Yes, I do. We go to a big supermarket every Saturday.",
        jhint: "Yes / No ＋ どこへ・どのくらい行くかを言ってみよう。" },
      { q: "What do you want to buy for your next birthday?",
        model: "I want to buy a new video game. I have wanted it for a long time.",
        jhint: "I want to buy 〜 で始めて、ひとこと理由もつけよう。" },
    ] },
];
