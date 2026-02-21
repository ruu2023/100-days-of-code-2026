export type Id = string;

export interface Task {
  id: Id;
  columnId: Id;
  content: string;
  position: number;
}

export interface Column {
  id: Id;
  title: string;
  position: number;
}
