/** Colour families of the shop filter. `key` is what the database stores in products.colors. */
export interface ColorFamily {
  key: string;
  label: string;
  /** Fill of the small circle. */
  hex: string;
}

export const COLOR_FAMILIES: ColorFamily[] = [
  { key: "white", label: "לבן", hex: "#F6F4EF" },
  { key: "cream", label: "קרם", hex: "#E6D9C0" },
  { key: "grey", label: "אפור", hex: "#9B9B9B" },
  { key: "black", label: "שחור", hex: "#1F1F1F" },
  { key: "brown", label: "חום", hex: "#8A5A3A" },
  { key: "blue", label: "כחול", hex: "#5E7FA0" },
  { key: "green", label: "ירוק", hex: "#93AD8C" },
  { key: "purple", label: "סגול", hex: "#7A5C8C" },
];

export const colorFamily = (key: string) => COLOR_FAMILIES.find((c) => c.key === key);
