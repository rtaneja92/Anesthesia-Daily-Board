export type StaffCategory = "Anesthesiologist" | "AHP" | "Relief";

export const CATEGORIES: StaffCategory[] = ["Anesthesiologist", "AHP", "Relief"];

export interface DragItem {
  name: string;
  type: string;
  originRow?: number;
  originCol?: string;
}

export interface BoardRowData {
  [columnKey: string]: string; // key is StaffCategory, value is Name
}

export interface BoardData {
  [rowIndex: number]: BoardRowData;
}

export interface BreakData {
  [rowIndex: number]: [boolean, boolean];
}
