// 日本の主要な連続資産・複合的な世界遺産の構成資産・所在地データ
//
// 世界遺産検定2級で頻出の「構成資産の数」「所在/またがる都道府県」「構成資産が無い県」
// 等の出題に対応するための構造化データ。
//
// 【出典】各遺産の公式サイト・自治体資料・UNESCO World Heritage Centre 等の公知情報。
//   主要な構成資産数・都道府県は2024年時点。
//   ※ totalAssets が null のものは「件数の数え方が文脈で変わる/単純な数値化が難しい」ため
//     件数クイズの対象外とし、所在地クイズのみ対象とする。

export interface SerialProperty {
  heritageId: number; // data/japan-heritages.ts の id と一致
  nameJa: string;
  inscriptionYear: number;
  totalAssets: number | null; // 構成資産数
  prefectures: string[]; // 所在(またがる)都道府県
  note?: string;
}

export const japanSerialProperties: SerialProperty[] = [
  {
    heritageId: 1467,
    nameJa: "明治日本の産業革命遺産 製鉄・製鋼、造船、石炭産業",
    inscriptionYear: 2015,
    totalAssets: 23,
    prefectures: ["福岡県", "長崎県", "佐賀県", "鹿児島県", "熊本県", "山口県", "岩手県", "静岡県"],
    note: "23資産・8県11市に分散。九州5県＋山口・岩手・静岡。",
  },
  {
    heritageId: 1389,
    nameJa: "富岡製糸場と絹産業遺産群",
    inscriptionYear: 2014,
    totalAssets: 4,
    prefectures: ["群馬県"],
    note: "富岡製糸場・田島弥平旧宅・高山社跡・荒船風穴の4資産。すべて群馬県。",
  },
  {
    heritageId: 1632,
    nameJa: "北海道・北東北の縄文遺跡群",
    inscriptionYear: 2021,
    totalAssets: 17,
    prefectures: ["北海道", "青森県", "岩手県", "秋田県"],
    note: "17資産。北海道と北東北3県にまたがる。",
  },
  {
    heritageId: 1338,
    nameJa: "富士山—信仰の対象と芸術の源泉",
    inscriptionYear: 2013,
    totalAssets: 25,
    prefectures: ["山梨県", "静岡県"],
    note: "25構成資産。山梨・静岡の2県にまたがる文化遺産。",
  },
  {
    heritageId: 1535,
    nameJa: "「神宿る島」宗像・沖ノ島と関連遺産群",
    inscriptionYear: 2017,
    totalAssets: 8,
    prefectures: ["福岡県"],
    note: "8資産すべて福岡県(宗像市・福津市)。",
  },
  {
    heritageId: 1495,
    nameJa: "長崎と天草地方の潜伏キリシタン関連遺産",
    inscriptionYear: 2018,
    totalAssets: 12,
    prefectures: ["長崎県", "熊本県"],
    note: "12資産。長崎県と熊本県(天草)にまたがる。",
  },
  {
    heritageId: 972,
    nameJa: "琉球王国のグスク及び関連遺産群",
    inscriptionYear: 2000,
    totalAssets: 9,
    prefectures: ["沖縄県"],
    note: "首里城跡・今帰仁城跡など9資産。すべて沖縄県。",
  },
  {
    heritageId: 1277,
    nameJa: "平泉—仏国土（浄土）を表す建築・庭園及び考古学的遺跡群",
    inscriptionYear: 2011,
    totalAssets: 5,
    prefectures: ["岩手県"],
    note: "中尊寺・毛越寺・観自在王院跡・無量光院跡・金鶏山の5資産。岩手県。",
  },
  {
    heritageId: 688,
    nameJa: "古都京都の文化財",
    inscriptionYear: 1994,
    totalAssets: 17,
    prefectures: ["京都府", "滋賀県"],
    note: "17資産。京都府(京都市・宇治市)と滋賀県(大津市)にまたがる。",
  },
  {
    heritageId: 870,
    nameJa: "古都奈良の文化財",
    inscriptionYear: 1998,
    totalAssets: 8,
    prefectures: ["奈良県"],
    note: "東大寺・興福寺・春日大社など8資産。奈良県。",
  },
  {
    heritageId: 1142,
    nameJa: "紀伊山地の霊場と参詣道",
    inscriptionYear: 2004,
    totalAssets: null,
    prefectures: ["三重県", "奈良県", "和歌山県"],
    note: "吉野・大峯、熊野三山、高野山の3霊場と参詣道。三重・奈良・和歌山の3県にまたがる。",
  },
  {
    heritageId: 1580,
    nameJa: "百舌鳥・古市古墳群—古代日本の墳墓群",
    inscriptionYear: 2019,
    totalAssets: null,
    prefectures: ["大阪府"],
    note: "45件・49基の古墳。大阪府(堺市・羽曳野市・藤井寺市)。",
  },
];

// 都道府県マスタ(「構成資産が無い都道府県」問題の誤答プール用)
export const PREFECTURES: string[] = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];
