/** Colour families of the shop filter. `key` is what the database stores in products.colors. */
export interface ColorFamily {
  key: string;
  label: string;
  /** CSS background of the small circle. */
  fill: string;
}

export const COLOR_FAMILIES: ColorFamily[] = [
  { key: "white", label: "לבן", fill: "#F6F4EF" },
  { key: "cream", label: "קרם", fill: "#E6D9C0" },
  { key: "grey", label: "אפור", fill: "#9B9B9B" },
  { key: "black", label: "שחור", fill: "#1F1F1F" },
  { key: "brown", label: "חום", fill: "#8A5A3A" },
  { key: "blue", label: "כחול", fill: "#5E7FA0" },
  { key: "green", label: "ירוק", fill: "#93AD8C" },
  { key: "purple", label: "סגול", fill: "#7A5C8C" },
  { key: "multi", label: "צבעוני", fill: "conic-gradient(#D94F4F, #F2A93B, #F2D64B, #6FB36F, #4F8FD9, #8A5CC4, #D94F4F)" },
];

export const colorFamily = (key: string) => COLOR_FAMILIES.find((c) => c.key === key);
