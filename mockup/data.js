// 画面の見本用データ。2026-09-25 に Gemini 3.8 Flash で実際に読み取った10件の結果
window.MOCK = {
 "recipes": [
  {
   "id": "4ada789b-dcfc-4086-8d45-406325056e08",
   "title": "あじキューライス",
   "url": "https://x.com/akari_hasegawa/status/2054138766579916865?s=46",
   "provider": "長谷川あかり",
   "categories": [
    {
     "id": 1,
     "name": "直近で作りたい！"
    }
   ],
   "imageUrls": [
    "https://3yfumgxchoad5iyv.public.blob.vercel-storage.com/IMG_3643.png"
   ],
   "createdAt": "2026-07-20",
   "extraction": {
    "status": "ok",
    "source": "Xの投稿と画像",
    "servings": "1人分",
    "ingredients": [
     {
      "text": "ごはん 1人分",
      "std": "ごはん",
      "guess": false
     },
     {
      "text": "あじ刺身(たたきでもOK) 60g",
      "std": "あじ（刺身用）",
      "guess": false
     },
     {
      "text": "きゅうり 120g (1本)",
      "std": "きゅうり",
      "guess": false
     },
     {
      "text": "生姜 15g",
      "std": "生姜",
      "guess": false
     },
     {
      "text": "塩 小さじ1/3〜1/2弱 (約2.5g・具材重量の1.3%)",
      "std": "塩",
      "guess": false
     },
     {
      "text": "酢 小さじ2",
      "std": "酢",
      "guess": false
     },
     {
      "text": "オリーブオイル 小さじ2",
      "std": "オリーブオイル",
      "guess": false
     },
     {
      "text": "あらびき黒胡椒 適宜",
      "std": "こしょう",
      "guess": false
     }
    ],
    "features": {
     "taste": [
      "さっぱり",
      "爽快"
     ],
     "main_ingredients": [
      "あじ",
      "きゅうり",
      "ごはん"
     ],
     "genre": "その他",
     "effort": "簡単",
     "cooking_time_minutes": 10,
     "scenes": [
      "夏向け",
      "時短",
      "ランチ"
     ],
     "summary": "刻んだきゅうりと生姜、あじの刺身をご飯にのせ、オリーブオイルと酢でさっぱりといただくサラダ感覚の丼。"
    }
   }
  },
  {
   "id": "7fa242b3-586a-4a5e-bc9a-66a3648f1828",
   "title": "冷しゃぶのだしびたし",
   "url": "https://x.com/akari_hasegawa/status/1934883153971413140?s=46",
   "provider": "長谷川あかり",
   "categories": [
    {
     "id": 1,
     "name": "直近で作りたい！"
    },
    {
     "id": 3,
     "name": "豚肉"
    }
   ],
   "imageUrls": [
    "https://3yfumgxchoad5iyv.public.blob.vercel-storage.com/IMG_3552.jpeg"
   ],
   "createdAt": "2026-07-11",
   "extraction": {
    "status": "ok",
    "source": "Xの投稿とリンク先のレシピページ",
    "servings": "2～3人分",
    "ingredients": [
     {
      "text": "豚ロース薄切り肉（しゃぶしゃぶ用） 160～200g",
      "std": "豚ロース薄切り肉",
      "guess": false
     },
     {
      "text": "水菜 1わ（約200g）",
      "std": "水菜",
      "guess": false
     },
     {
      "text": "ミディトマト 2～3個",
      "std": "トマト",
      "guess": false
     },
     {
      "text": "削り節 8g",
      "std": "かつお節",
      "guess": false
     },
     {
      "text": "しょうゆ 大さじ1",
      "std": "しょうゆ",
      "guess": false
     },
     {
      "text": "塩 小さじ1",
      "std": "塩",
      "guess": false
     },
     {
      "text": "ゆずこしょう 適宜",
      "std": "柚子胡椒",
      "guess": false
     },
     {
      "text": "ごま油 少々",
      "std": "ごま油",
      "guess": false
     }
    ],
    "features": {
     "taste": [
      "さっぱり",
      "だし味"
     ],
     "main_ingredients": [
      "豚ロース薄切り肉",
      "水菜",
      "トマト"
     ],
     "genre": "和食",
     "effort": "簡単",
     "cooking_time_minutes": 15,
     "scenes": [
      "夏向け",
      "作り置き",
      "おつまみ"
     ],
     "summary": "ゆでた豚肉と野菜をかつお節と調味料を合わせたひたし地に浸して冷やす、さっぱりとした冷しゃぶ。"
    }
   }
  },
  {
   "id": "0918c79c-7f30-47ed-bb9c-56446ed13bac",
   "title": "肉ニラ混ぜ飯",
   "url": "https://x.com/yohtaro007/status/2070824482244342204/video/1?s=46",
   "provider": "",
   "categories": [
    {
     "id": 1,
     "name": "直近で作りたい！"
    },
    {
     "id": 2,
     "name": "牛肉"
    },
    {
     "id": 3,
     "name": "豚肉"
    },
    {
     "id": 6,
     "name": "クイックメニュー"
    }
   ],
   "imageUrls": [
    "https://3yfumgxchoad5iyv.public.blob.vercel-storage.com/IMG_3453.png"
   ],
   "createdAt": "2026-06-28",
   "extraction": {
    "status": "guess",
    "source": "Xの投稿（動画のため材料の記載なし）",
    "servings": "",
    "ingredients": [
     {
      "text": "ご飯",
      "std": "ご飯",
      "guess": true
     },
     {
      "text": "豚ひき肉",
      "std": "豚ひき肉",
      "guess": true
     },
     {
      "text": "ニラ",
      "std": "ニラ",
      "guess": true
     },
     {
      "text": "しょうゆ",
      "std": "しょうゆ",
      "guess": true
     },
     {
      "text": "ごま油",
      "std": "ごま油",
      "guess": true
     }
    ],
    "features": {
     "taste": [
      "旨辛",
      "こってり"
     ],
     "main_ingredients": [
      "豚ひき肉",
      "ニラ",
      "ご飯"
     ],
     "genre": "中華",
     "effort": "簡単",
     "cooking_time_minutes": 15,
     "scenes": [
      "がっつり",
      "時短",
      "ランチ"
     ],
     "summary": "炒めたひき肉とニラをご飯に混ぜ合わせたスタミナ満点の混ぜご飯。"
    }
   }
  },
  {
   "id": "cb6a5937-74c6-4f11-921a-5ac4e1d82e6f",
   "title": "水菜とベーコンのサラダ",
   "url": "https://x.com/78milktea1/status/2012048250803798310?s=46&t=jJDcYFib2YEokP3_bwBItQ",
   "provider": "",
   "categories": [
    {
     "id": 1,
     "name": "直近で作りたい！"
    },
    {
     "id": 10,
     "name": "ご飯・サラダ等"
    }
   ],
   "imageUrls": [],
   "createdAt": "2026-01-20",
   "extraction": {
    "status": "guess",
    "source": "Xの投稿（動画のため材料の記載なし）",
    "servings": "",
    "ingredients": [
     {
      "text": "水菜",
      "std": "水菜",
      "guess": true
     },
     {
      "text": "ベーコン",
      "std": "ベーコン",
      "guess": true
     },
     {
      "text": "キノコ",
      "std": "きのこ",
      "guess": true
     }
    ],
    "features": {
     "taste": [
      "さっぱり"
     ],
     "main_ingredients": [
      "水菜",
      "ベーコン",
      "きのこ"
     ],
     "genre": "洋食",
     "effort": "簡単",
     "cooking_time_minutes": 10,
     "scenes": [
      "副菜",
      "おつまみ"
     ],
     "summary": "ベーコンの塩気ときのこの旨みをシャキシャキの水菜と合わせたサラダ。"
    }
   }
  },
  {
   "id": "2b501504-66b2-4662-b9a2-46f889bd99db",
   "title": "ほったらかしポトフ",
   "url": "https://www.instagram.com/reel/DdWFFnFTtzh/?stkn=Y3ZmajJ4NWxqOHE4",
   "provider": "",
   "categories": [
    {
     "id": 1,
     "name": "直近で作りたい！"
    },
    {
     "id": 6,
     "name": "クイックメニュー"
    }
   ],
   "imageUrls": [
    "https://3yfumgxchoad5iyv.public.blob.vercel-storage.com/IMG_4315.jpeg"
   ],
   "createdAt": "2026-09-19",
   "extraction": {
    "status": "ok",
    "source": "Instagramの投稿文",
    "servings": "",
    "ingredients": [
     {
      "text": "じゃがいも 2個",
      "std": "じゃがいも",
      "guess": false
     },
     {
      "text": "ソーセージ 6本",
      "std": "ソーセージ",
      "guess": false
     },
     {
      "text": "キャベツ 1/4個",
      "std": "キャベツ",
      "guess": false
     },
     {
      "text": "玉ねぎ 1個",
      "std": "玉ねぎ",
      "guess": false
     },
     {
      "text": "にんじん 1本",
      "std": "にんじん",
      "guess": false
     },
     {
      "text": "コンソメ 小さじ2",
      "std": "コンソメ",
      "guess": false
     },
     {
      "text": "塩こしょう 少々",
      "std": "塩こしょう",
      "guess": false
     }
    ],
    "features": {
     "taste": [
      "あっさり",
      "優しい味"
     ],
     "main_ingredients": [
      "ソーセージ",
      "じゃがいも",
      "キャベツ",
      "玉ねぎ",
      "にんじん"
     ],
     "genre": "洋食",
     "effort": "簡単",
     "cooking_time_minutes": 50,
     "scenes": [
      "時短",
      "夕食",
      "ほったらかし"
     ],
     "summary": "具材を切って炊飯器に入れるだけで手軽に作れる、野菜たっぷりのポトフ。"
    }
   }
  },
  {
   "id": "0ebb2389-1fe2-454c-a9c5-ad592ccd691a",
   "title": "ほうれん草豚しゃぶ",
   "url": "https://www.instagram.com/p/DKOlQOuS60R/?igsh=MWdhdmQzYTI1NWFzZg==",
   "provider": "もも",
   "categories": [
    {
     "id": 3,
     "name": "豚肉"
    }
   ],
   "imageUrls": [],
   "createdAt": "2026-01-21",
   "extraction": {
    "status": "ok",
    "source": "Instagramの投稿文",
    "servings": "",
    "ingredients": [
     {
      "text": "豚バラ肉（しゃぶしゃぶ用） 200g",
      "std": "豚バラ薄切り肉",
      "guess": false
     },
     {
      "text": "ほうれん草 1束",
      "std": "ほうれん草",
      "guess": false
     },
     {
      "text": "酒 大さじ1",
      "std": "酒",
      "guess": false
     },
     {
      "text": "片栗粉 大さじ1",
      "std": "片栗粉",
      "guess": false
     },
     {
      "text": "いりごま 大さじ1",
      "std": "いりごま",
      "guess": false
     },
     {
      "text": "ポン酢 大さじ3",
      "std": "ポン酢",
      "guess": false
     },
     {
      "text": "オリーブオイル 大さじ1",
      "std": "オリーブオイル",
      "guess": false
     },
     {
      "text": "豆板醤 小さじ1/2",
      "std": "豆板醤",
      "guess": false
     },
     {
      "text": "おろししょうが 1片分",
      "std": "しょうが",
      "guess": false
     },
     {
      "text": "おろしにんにく 少々",
      "std": "にんにく",
      "guess": false
     }
    ],
    "features": {
     "taste": [
      "ピリ辛",
      "さっぱり"
     ],
     "main_ingredients": [
      "豚バラ肉",
      "ほうれん草"
     ],
     "genre": "和食",
     "effort": "簡単",
     "cooking_time_minutes": 10,
     "scenes": [
      "夏向け",
      "おつまみ",
      "副菜"
     ],
     "summary": "片栗粉を加えてやわらかく茹でた豚バラ肉とほうれん草を、ピリ辛ポン酢ドレッシングでさっぱり味わう冷しゃぶサラダです。"
    }
   }
  },
  {
   "id": "39152201-06f9-41fc-96a0-ab3b88b85a03",
   "title": "マカロニサラダ",
   "url": "https://cookpad.com/jp/recipes/21449880",
   "provider": "",
   "categories": [
    {
     "id": 10,
     "name": "ご飯・サラダ等"
    }
   ],
   "imageUrls": [
    "https://3yfumgxchoad5iyv.public.blob.vercel-storage.com/IMG_4409.jpeg"
   ],
   "createdAt": "2026-03-23",
   "extraction": {
    "status": "ok",
    "source": "レシピサイトのページ",
    "servings": "5人分〜6人分",
    "ingredients": [
     {
      "text": "マカロニ 100g",
      "std": "マカロニ",
      "guess": false
     },
     {
      "text": "人参 1/3本",
      "std": "人参",
      "guess": false
     },
     {
      "text": "きゅうり 1/2本",
      "std": "きゅうり",
      "guess": false
     },
     {
      "text": "ハム 1パック(4枚)",
      "std": "ハム",
      "guess": false
     },
     {
      "text": "マヨネーズ 大さじ6",
      "std": "マヨネーズ",
      "guess": false
     },
     {
      "text": "酢 小さじ1",
      "std": "酢",
      "guess": false
     },
     {
      "text": "砂糖 小さじ1",
      "std": "砂糖",
      "guess": false
     },
     {
      "text": "塩・コショウ 少々",
      "std": "塩こしょう",
      "guess": false
     },
     {
      "text": "オリーブオイル【油】 1周",
      "std": "オリーブオイル",
      "guess": false
     }
    ],
    "features": {
     "taste": [
      "マヨネーズ味",
      "まろやか",
      "甘め"
     ],
     "main_ingredients": [
      "マカロニ",
      "ハム",
      "きゅうり",
      "人参"
     ],
     "genre": "洋食",
     "effort": "簡単",
     "cooking_time_minutes": 15,
     "scenes": [
      "お弁当",
      "作り置き",
      "子供向け"
     ],
     "summary": "マヨネーズとほんのり砂糖の甘みで子供も食べやすい、定番のマカロニサラダ。"
    }
   }
  },
  {
   "id": "78c224ad-1e20-44d1-b208-f93c90f91ef8",
   "title": "塩麹しょうが焼き",
   "url": "https://www.kurashiru.com/recipes/769155ff-c688-4a8c-8cd0-df6adf812376",
   "provider": "",
   "categories": [
    {
     "id": 1,
     "name": "直近で作りたい！"
    },
    {
     "id": 3,
     "name": "豚肉"
    }
   ],
   "imageUrls": [
    "https://3yfumgxchoad5iyv.public.blob.vercel-storage.com/IMG_2607.jpeg"
   ],
   "createdAt": "2026-05-06",
   "extraction": {
    "status": "ok",
    "source": "レシピサイトのページ",
    "servings": "2人分",
    "ingredients": [
     {
      "text": "豚ロース 300g",
      "std": "豚ロース肉",
      "guess": false
     },
     {
      "text": "玉ねぎ 1/2個",
      "std": "玉ねぎ",
      "guess": false
     },
     {
      "text": "しょうゆ 大さじ3",
      "std": "しょうゆ",
      "guess": false
     },
     {
      "text": "みりん 大さじ2",
      "std": "みりん",
      "guess": false
     },
     {
      "text": "塩麹 大さじ1",
      "std": "塩麹",
      "guess": false
     },
     {
      "text": "すりおろし生姜 大さじ1/2",
      "std": "生姜",
      "guess": false
     },
     {
      "text": "サラダ油 大さじ1",
      "std": "サラダ油",
      "guess": false
     },
     {
      "text": "キャベツ 60g",
      "std": "キャベツ",
      "guess": false
     },
     {
      "text": "ミニトマト 4個",
      "std": "ミニトマト",
      "guess": false
     }
    ],
    "features": {
     "taste": [
      "甘辛",
      "こってり"
     ],
     "main_ingredients": [
      "豚ロース肉",
      "玉ねぎ"
     ],
     "genre": "和食",
     "effort": "簡単",
     "cooking_time_minutes": 15,
     "scenes": [
      "主菜",
      "お弁当",
      "夕食"
     ],
     "summary": "塩麹の旨みで豚肉がジューシーに仕上がる、ご飯が進む生姜焼きです。"
    }
   }
  },
  {
   "id": "be83a81d-5e83-4a2e-bbd0-15330ce4f51b",
   "title": "小松菜肉巻き",
   "url": "https://www.orangepage.net/recipes/302854",
   "provider": "",
   "categories": [
    {
     "id": 3,
     "name": "豚肉"
    },
    {
     "id": 11,
     "name": "しぶちんレシピ"
    }
   ],
   "imageUrls": [
    "https://3yfumgxchoad5iyv.public.blob.vercel-storage.com/IMG_2900.webp"
   ],
   "createdAt": "2026-05-24",
   "extraction": {
    "status": "ok",
    "source": "レシピサイトのページ",
    "servings": "2人分",
    "ingredients": [
     {
      "text": "小松菜 1わ",
      "std": "小松菜",
      "guess": false
     },
     {
      "text": "豚ロース薄切り 8枚",
      "std": "豚ロース薄切り肉",
      "guess": false
     },
     {
      "text": "砂糖 大さじ1/2",
      "std": "砂糖",
      "guess": false
     },
     {
      "text": "酒 大さじ1/2",
      "std": "酒",
      "guess": false
     },
     {
      "text": "みりん 大さじ1/2",
      "std": "みりん",
      "guess": false
     },
     {
      "text": "しょうゆ 大さじ2",
      "std": "しょうゆ",
      "guess": false
     },
     {
      "text": "レモンの半月切り 適宜",
      "std": "レモン",
      "guess": false
     },
     {
      "text": "小麦粉 適宜",
      "std": "小麦粉",
      "guess": false
     },
     {
      "text": "サラダ油 大さじ1/2",
      "std": "サラダ油",
      "guess": false
     }
    ],
    "features": {
     "taste": [
      "甘辛"
     ],
     "main_ingredients": [
      "小松菜",
      "豚ロース薄切り肉"
     ],
     "genre": "和食",
     "effort": "ふつう",
     "cooking_time_minutes": 20,
     "scenes": [
      "お弁当",
      "普段のおかず"
     ],
     "summary": "シャキシャキの小松菜を豚肉で巻き、甘辛いたれを絡めて焼き上げた一品。"
    }
   }
  },
  {
   "id": "b52d9146-61a9-477b-aa50-dbee8d7d7c18",
   "title": "豚しゃぶレタス",
   "url": "https://oceans-nadia.com/user/484627/recipe/464942",
   "provider": "",
   "categories": [
    {
     "id": 6,
     "name": "クイックメニュー"
    }
   ],
   "imageUrls": [
    "https://3yfumgxchoad5iyv.public.blob.vercel-storage.com/IMG_4019.jpeg"
   ],
   "createdAt": "2026-08-17",
   "extraction": {
    "status": "ok",
    "source": "レシピサイトのページ",
    "servings": "2人分",
    "ingredients": [
     {
      "text": "豚しゃぶ肉 200g",
      "std": "豚薄切り肉",
      "guess": false
     },
     {
      "text": "レタス 1/2個(250g)",
      "std": "レタス",
      "guess": false
     },
     {
      "text": "酒 小さじ1",
      "std": "酒",
      "guess": false
     },
     {
      "text": "醤油 小さじ1",
      "std": "しょうゆ",
      "guess": false
     },
     {
      "text": "にんにくチューブ 小さじ1",
      "std": "おろしにんにく",
      "guess": false
     },
     {
      "text": "ポン酢 大さじ2",
      "std": "ポン酢",
      "guess": false
     },
     {
      "text": "砂糖 小さじ1.5",
      "std": "砂糖",
      "guess": false
     },
     {
      "text": "鶏がらスープの素 小さじ1.5",
      "std": "鶏がらスープの素",
      "guess": false
     }
    ],
    "features": {
     "taste": [
      "さっぱり"
     ],
     "main_ingredients": [
      "豚しゃぶ肉",
      "レタス"
     ],
     "genre": "和食",
     "effort": "簡単",
     "cooking_time_minutes": 10,
     "scenes": [
      "時短",
      "おつまみ",
      "夏向け"
     ],
     "summary": "豚しゃぶ肉とレタスをさっぱりとしたポン酢だれで和えた、包丁要らずで作れる時短おかず。"
    }
   }
  }
 ],
 "pantry": [
  "しょうゆ",
  "みりん",
  "酒",
  "砂糖",
  "塩",
  "サラダ油",
  "オリーブオイル",
  "ごま油",
  "こしょう",
  "塩こしょう",
  "酢",
  "マヨネーズ",
  "ケチャップ",
  "味噌",
  "めんつゆ",
  "ポン酢",
  "小麦粉",
  "片栗粉",
  "鶏がらスープの素",
  "コンソメ",
  "顆粒だし"
 ]
};
