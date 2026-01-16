export type Id = string | number;

export interface Task {
  id: Id;
  columnId: Id;
  content: string;
}

export interface Column {
  id: Id;
  title: string;
}
