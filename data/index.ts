// 全世界遺産データのエクスポート
export { japanHeritages } from "./japan-heritages";
export { europeHeritages } from "./world-heritages-europe";
export { asiaHeritages } from "./world-heritages-asia";
export { americasHeritages } from "./world-heritages-americas";
export { africaHeritages } from "./world-heritages-africa";
export { arabHeritages } from "./world-heritages-arab";

import { japanHeritages } from "./japan-heritages";
import { europeHeritages } from "./world-heritages-europe";
import { asiaHeritages } from "./world-heritages-asia";
import { americasHeritages } from "./world-heritages-americas";
import { africaHeritages } from "./world-heritages-africa";
import { arabHeritages } from "./world-heritages-arab";

export const allHeritages = [
  ...japanHeritages,
  ...europeHeritages,
  ...asiaHeritages,
  ...americasHeritages,
  ...africaHeritages,
  ...arabHeritages,
];
